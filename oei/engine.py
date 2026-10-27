"""Option Edge Index (OEI) engine — Gamma Squeeze Research, methodology v0.1.

OEI         30-day constant-maturity implied volatility (VIX-style model-free variance) for SPY or QQQ.
Fair Vol    independent 30-day realized-volatility forecast (HAR-RV by default, EWMA as a check).
Edge Spread OEI - Fair Vol, in volatility points.
VRP         (OEI/100)^2 - (Fair Vol/100)^2, in annualized variance.

All annualization follows one rule: a variance accumulated over a window of `days` calendar days is
annualized by 365/days. Realized-vol *display* figures (RV5/RV20/RV60) keep the market convention of 252.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Sequence

import numpy as np

TARGET_DAYS = 30
TRADING_DAYS_PER_YEAR = 252


# ---------------------------------------------------------------------------
# Implied variance (OEI)
# ---------------------------------------------------------------------------

@dataclass
class Quote:
    strike: float
    call_bid: float
    call_ask: float
    put_bid: float
    put_ask: float

    @property
    def call_mid(self) -> float:
        return (self.call_bid + self.call_ask) / 2

    @property
    def put_mid(self) -> float:
        return (self.put_bid + self.put_ask) / 2


@dataclass
class Expiry:
    t: float                    # time to expiry in years (calendar, /365)
    r: float                    # continuously compounded risk-free rate for this tenor
    quotes: list[Quote]
    forward: float | None = None  # pass a dividend-adjusted forward for ETF (American) options


def forward_with_dividends(spot: float, r: float, t: float, dividends: Sequence[tuple[float, float]] = ()) -> float:
    """Forward price of an ETF with discrete cash dividends [(time_in_years, amount), ...] paid before expiry."""
    pv_div = sum(amt * math.exp(-r * td) for td, amt in dividends if 0 < td <= t)
    return (spot - pv_div) * math.exp(r * t)


def forward_from_parity(exp: Expiry) -> tuple[float, float]:
    """Cboe step: strike where |call mid - put mid| is smallest, F = K + e^{rT}(C - P). Returns (F, that strike)."""
    usable = [q for q in exp.quotes if q.call_bid > 0 and q.put_bid > 0]
    if not usable:
        raise ValueError('no two-sided quotes to infer the forward')
    q = min(usable, key=lambda q: abs(q.call_mid - q.put_mid))
    return q.strike + math.exp(exp.r * exp.t) * (q.call_mid - q.put_mid), q.strike


def select_otm(exp: Expiry, k0: float) -> list[tuple[float, float]]:
    """Out-of-the-money strip with Cboe truncation: skip zero bids, stop after two consecutive zero bids.

    Returns [(strike, Q)] sorted by strike; at K0 Q is the average of the call and put mids.
    """
    qs = sorted(exp.quotes, key=lambda q: q.strike)
    puts, calls = [], []
    zeros = 0
    for q in reversed([q for q in qs if q.strike < k0]):
        if q.put_bid <= 0:
            zeros += 1
            if zeros >= 2:
                break
            continue
        zeros = 0
        puts.append((q.strike, q.put_mid))
    zeros = 0
    for q in [q for q in qs if q.strike > k0]:
        if q.call_bid <= 0:
            zeros += 1
            if zeros >= 2:
                break
            continue
        zeros = 0
        calls.append((q.strike, q.call_mid))
    at = [q for q in qs if q.strike == k0]
    mid = [(k0, (at[0].call_mid + at[0].put_mid) / 2)] if at else []
    return sorted(puts) + mid + calls


def expiry_variance(exp: Expiry) -> float:
    """Annualized model-free implied variance for one expiry (VIX white-paper formula)."""
    if exp.forward is not None:
        f = exp.forward
    else:
        f, _ = forward_from_parity(exp)
    strikes = sorted(q.strike for q in exp.quotes)
    below = [k for k in strikes if k <= f]
    if not below:
        raise ValueError('no strike at or below the forward')
    k0 = below[-1]
    strip = select_otm(exp, k0)
    if len(strip) < 3:
        raise ValueError('too few out-of-the-money quotes')
    ks = np.array([k for k, _ in strip])
    qv = np.array([q for _, q in strip])
    dk = np.empty_like(ks)
    dk[1:-1] = (ks[2:] - ks[:-2]) / 2
    dk[0], dk[-1] = ks[1] - ks[0], ks[-1] - ks[-2]
    total = (2 / exp.t) * np.sum(dk / ks**2 * math.exp(exp.r * exp.t) * qv)
    return float(total - (1 / exp.t) * (f / k0 - 1) ** 2)


def interpolate_variance(t1: float, v1: float, t2: float, v2: float, target_days: int = TARGET_DAYS) -> float:
    """Constant-maturity annualized variance from two expiries bracketing the target (total-variance interpolation)."""
    ts = target_days / 365
    if not (t1 <= ts <= t2) or t1 == t2:
        raise ValueError('expiries must bracket the target tenor')
    return (t1 * v1 * (t2 - ts) + t2 * v2 * (ts - t1)) / (ts * (t2 - t1))


def oei(near: Expiry, nxt: Expiry, target_days: int = TARGET_DAYS) -> float:
    v = interpolate_variance(near.t, expiry_variance(near), nxt.t, expiry_variance(nxt), target_days)
    return 100 * math.sqrt(max(v, 0.0))


# ---------------------------------------------------------------------------
# Realized volatility and Fair Vol
# ---------------------------------------------------------------------------

def log_returns(prices: Sequence[float]) -> np.ndarray:
    p = np.asarray(prices, dtype=float)
    return np.diff(np.log(p))


def realized_vol(returns: Sequence[float], n: int) -> float:
    """RV_n in vol points, sample std of the last n daily log returns annualized by 252 (display convention)."""
    r = np.asarray(returns, dtype=float)[-n:]
    if len(r) < 2:
        raise ValueError('need at least two returns')
    return float(100 * math.sqrt(TRADING_DAYS_PER_YEAR * np.var(r, ddof=1)))


def ewma_variance(returns: Sequence[float], lam: float = 0.94) -> float:
    """Current one-day variance under EWMA (RiskMetrics). Flat term structure: no mean reversion."""
    r = np.asarray(returns, dtype=float)
    v = float(np.mean(r[: min(20, len(r))] ** 2))
    for x in r:
        v = lam * v + (1 - lam) * x * x
    return v


@dataclass
class HarModel:
    coef: np.ndarray            # [b0, b_day, b_week, b_month]
    horizon: int

    def forecast_daily_variance(self, returns: Sequence[float]) -> float:
        """Average daily variance expected over the next `horizon` trading days."""
        rv = np.asarray(returns, dtype=float) ** 2
        x = np.array([1.0, rv[-1], rv[-5:].mean(), rv[-22:].mean()])
        return float(max(x @ self.coef, 1e-12))


def fit_har(returns: Sequence[float], horizon: int = 21, event_mask: Sequence[bool] | None = None) -> HarModel:
    """Direct HAR-RV regression of the next-`horizon`-day average squared return on 1/5/22-day averages.

    Event days (CPI, FOMC, ...) are excluded from the target so their extra variance is added once, separately.
    """
    rv = np.asarray(returns, dtype=float) ** 2
    mask = np.zeros(len(rv), bool) if event_mask is None else np.asarray(event_mask, bool)
    rows, ys = [], []
    for t in range(21, len(rv) - horizon):
        fut = rv[t + 1 : t + 1 + horizon][~mask[t + 1 : t + 1 + horizon]]
        if len(fut) == 0:
            continue
        rows.append([1.0, rv[t], rv[t - 4 : t + 1].mean(), rv[t - 21 : t + 1].mean()])
        ys.append(fut.mean())
    if len(rows) < 60:
        raise ValueError('need a longer history to fit HAR-RV (>= ~100 trading days)')
    coef, *_ = np.linalg.lstsq(np.array(rows), np.array(ys), rcond=None)
    return HarModel(coef=coef, horizon=horizon)


def event_excess_variance(returns: Sequence[float], event_mask: Sequence[bool]) -> float:
    """Extra daily variance on event days versus ordinary days, estimated from history (floored at 0)."""
    r2 = np.asarray(returns, dtype=float) ** 2
    m = np.asarray(event_mask, bool)
    if m.sum() == 0 or (~m).sum() == 0:
        return 0.0
    return float(max(r2[m].mean() - r2[~m].mean(), 0.0))


def fair_vol(daily_variance: float, trading_days: int, events_ahead: int = 0, event_variance: float = 0.0,
             window_days: int = TARGET_DAYS) -> float:
    """Annualized Fair Vol for the next `window_days` calendar days.

    Total forecast variance = ordinary daily variance x trading days in the window + extra variance per known event.
    Close-to-close returns already include overnight gaps and weekends, so no separate weekend term is added.
    """
    total = daily_variance * trading_days + events_ahead * event_variance
    return 100 * math.sqrt(total * 365 / window_days)


def trading_days_between(start: np.datetime64, days: int = TARGET_DAYS, holidays: Sequence[np.datetime64] = ()) -> int:
    """Business days in (start, start + days], excluding holidays."""
    s = np.datetime64(start, 'D') + 1
    return int(np.busday_count(s, np.datetime64(start, 'D') + days + 1, holidays=list(holidays)))


# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

def edge_spread(oei_value: float, fair: float) -> float:
    return oei_value - fair


def vrp(oei_value: float, fair: float) -> float:
    return (oei_value / 100) ** 2 - (fair / 100) ** 2


def expected_move(spot: float, vol: float, days: int = TARGET_DAYS) -> float:
    """One-standard-deviation move over `days` calendar days from an annualized vol in points."""
    return spot * vol / 100 * math.sqrt(days / 365)


def percentile_rank(history: Sequence[float], value: float) -> float:
    h = np.asarray(history, dtype=float)
    return float(100 * (h < value).mean()) if len(h) else float('nan')
