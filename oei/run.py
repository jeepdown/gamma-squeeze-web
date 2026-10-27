"""Compute today's OEI snapshot for SPY and QQQ and print (or publish) it as JSON.

Inputs per symbol, in a folder such as data/SPY/:
  chain_<YYYY-MM-DD>.csv  one file per expiry: strike,call_bid,call_ask,put_bid,put_ask
  prices.csv              date,close (daily closes, oldest first, >= ~300 rows)
  meta.json               {"spot": 671.2, "rate": 0.041, "dividends": [["2026-12-19", 1.85]]}
Shared: events.csv        date,name (CPI, FOMC, NFP, mega-cap earnings) past and upcoming

Usage:
  python3 oei/run.py --data data --asof 2026-10-26            # print JSON
  python3 oei/run.py --data data --asof 2026-10-26 --publish  # POST to /api/admin/publish (needs GS_API, GS_TOKEN)
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import urllib.request
from datetime import date, datetime
from pathlib import Path

import numpy as np

import engine as E

SYMBOLS = ('SPY', 'QQQ')


def read_csv(path: Path) -> list[dict]:
    with open(path, newline='') as f:
        return list(csv.DictReader(f))


def years_between(a: date, b: date) -> float:
    # Expiry at the 16:00 ET close; one day of precision is enough for a daily snapshot.
    return (b - a).days / 365


def bracketing_expiries(folder: Path, asof: date, target_days: int) -> list[tuple[date, Path]]:
    exps = sorted((datetime.strptime(p.stem.split('_')[1], '%Y-%m-%d').date(), p) for p in folder.glob('chain_*.csv'))
    near = [e for e in exps if 0 < (e[0] - asof).days <= target_days]
    nxt = [e for e in exps if (e[0] - asof).days > target_days]
    if not near or not nxt:
        raise SystemExit(f'{folder.name}: need expiries on both sides of {target_days} days')
    return [near[-1], nxt[0]]


def symbol_snapshot(folder: Path, asof: date, events: list[tuple[date, str]], target_days: int = E.TARGET_DAYS) -> dict:
    meta = json.loads((folder / 'meta.json').read_text())
    spot, rate = float(meta['spot']), float(meta['rate'])
    divs = [(datetime.strptime(d, '%Y-%m-%d').date(), float(a)) for d, a in meta.get('dividends', [])]

    exps = []
    for exp_date, path in bracketing_expiries(folder, asof, target_days):
        t = years_between(asof, exp_date)
        quotes = [E.Quote(float(r['strike']), float(r['call_bid']), float(r['call_ask']), float(r['put_bid']), float(r['put_ask']))
                  for r in read_csv(path)]
        fwd = E.forward_with_dividends(spot, rate, t, [(years_between(asof, d), a) for d, a in divs if asof < d <= exp_date])
        exps.append(E.Expiry(t=t, r=rate, quotes=quotes, forward=fwd))
    oei = E.oei(exps[0], exps[1], target_days)

    prices = read_csv(folder / 'prices.csv')
    days = [datetime.strptime(p['date'], '%Y-%m-%d').date() for p in prices]
    rets = E.log_returns([float(p['close']) for p in prices])
    ev_days = {d for d, _ in events}
    mask = np.array([d in ev_days for d in days[1:]])
    model = E.fit_har(rets, horizon=21, event_mask=mask)
    daily_var = model.forecast_daily_variance(rets)
    upcoming = [(d, n) for d, n in events if 0 < (d - asof).days <= target_days]
    n_td = E.trading_days_between(np.datetime64(asof), target_days)
    fair = E.fair_vol(daily_var, n_td, len(upcoming), E.event_excess_variance(rets, mask), target_days)
    fair_ewma = E.fair_vol(E.ewma_variance(rets), n_td, len(upcoming), E.event_excess_variance(rets, mask), target_days)

    return {
        'spot': spot, 'oei': round(oei, 2), 'fair_vol': round(fair, 2), 'fair_vol_ewma': round(fair_ewma, 2),
        'edge_spread': round(E.edge_spread(oei, fair), 2), 'vrp': round(E.vrp(oei, fair), 5),
        'expected_move_30d': round(E.expected_move(spot, oei, target_days), 2),
        'rv5': round(E.realized_vol(rets, 5), 2), 'rv20': round(E.realized_vol(rets, 20), 2), 'rv60': round(E.realized_vol(rets, 60), 2),
        'events_ahead': [{'date': d.isoformat(), 'name': n} for d, n in upcoming],
        'expiries': [e.t for e in exps], 'trading_days': n_td,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', type=Path, required=True)
    ap.add_argument('--asof', type=lambda s: datetime.strptime(s, '%Y-%m-%d').date(), default=date.today())
    ap.add_argument('--publish', action='store_true')
    a = ap.parse_args()
    ev_file = a.data / 'events.csv'
    events = [(datetime.strptime(r['date'], '%Y-%m-%d').date(), r['name']) for r in read_csv(ev_file)] if ev_file.exists() else []
    snap = {'asof': a.asof.isoformat(), 'version': '0.1', 'rows': {s: symbol_snapshot(a.data / s, a.asof, events) for s in SYMBOLS}}
    if not a.publish:
        print(json.dumps(snap, ensure_ascii=False, indent=2))
        return
    req = urllib.request.Request(f"{os.environ['GS_API']}/api/admin/publish", method='POST',
                                 data=json.dumps({'kind': 'oei', 'item': snap}).encode(),
                                 headers={'Content-Type': 'application/json', 'Authorization': f"Bearer {os.environ['GS_TOKEN']}"})
    with urllib.request.urlopen(req) as r:
        print(r.read().decode())


if __name__ == '__main__':
    main()
