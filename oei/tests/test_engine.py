"""OEI engine tests. Run: python3 -m unittest discover -s oei/tests"""
import math
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import engine as E  # noqa: E402


def _ncdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def bs(s, k, t, r, vol, call):
    d1 = (math.log(s / k) + (r + vol * vol / 2) * t) / (vol * math.sqrt(t))
    d2 = d1 - vol * math.sqrt(t)
    if call:
        return s * _ncdf(d1) - k * math.exp(-r * t) * _ncdf(d2)
    return k * math.exp(-r * t) * _ncdf(-d2) - s * _ncdf(-d1)


def chain(s, t, r, vol, lo=40, hi=220, step=1.0, spread=0.0):
    qs = []
    k = lo
    while k <= hi:
        c, p = bs(s, k, t, r, vol, True), bs(s, k, t, r, vol, False)
        cb, pb = (c - spread if c > 0.005 else 0.0), (p - spread if p > 0.005 else 0.0)
        qs.append(E.Quote(k, max(cb, 0), c + spread, max(pb, 0), p + spread))
        k += step
    return E.Expiry(t=t, r=r, quotes=qs)


class ImpliedVariance(unittest.TestCase):
    def test_flat_black_scholes_chain_recovers_input_variance(self):
        for vol in (0.12, 0.20, 0.35):
            exp = chain(100, 30 / 365, 0.04, vol, step=0.25)  # SPY-like strike spacing relative to spot
            self.assertAlmostEqual(E.expiry_variance(exp), vol * vol, delta=vol * vol * 0.01)

    def test_forward_from_put_call_parity(self):
        exp = chain(100, 30 / 365, 0.04, 0.2)
        f, _ = E.forward_from_parity(exp)
        self.assertAlmostEqual(f, 100 * math.exp(0.04 * 30 / 365), places=6)

    def test_dividend_forward(self):
        f = E.forward_with_dividends(700, 0.04, 30 / 365, [(10 / 365, 1.8)])
        self.assertAlmostEqual(f, (700 - 1.8 * math.exp(-0.04 * 10 / 365)) * math.exp(0.04 * 30 / 365), places=9)
        self.assertLess(f, 700 * math.exp(0.04 * 30 / 365))

    def test_two_consecutive_zero_bids_truncate_the_strip(self):
        exp = chain(100, 30 / 365, 0.04, 0.6, lo=60, hi=140)
        for q in exp.quotes:
            if q.strike in (70, 71):
                q.put_bid = 0.0
        strikes = [k for k, _ in E.select_otm(exp, 100)]
        self.assertNotIn(69, strikes)
        self.assertIn(72, strikes)

    def test_thirty_day_interpolation(self):
        t1, t2 = 23 / 365, 37 / 365
        v = E.interpolate_variance(t1, 0.18**2, t2, 0.22**2)
        self.assertTrue(0.18**2 < v < 0.22**2)
        self.assertAlmostEqual(E.interpolate_variance(t1, 0.04, t2, 0.04), 0.04, places=12)
        with self.assertRaises(ValueError):
            E.interpolate_variance(31 / 365, 0.04, 40 / 365, 0.04)

    def test_oei_from_two_expiries(self):
        near, nxt = (chain(600, d / 365, 0.04, 0.185, lo=300, hi=900) for d in (23, 37))
        self.assertAlmostEqual(E.oei(near, nxt), 18.5, delta=0.2)


class FairVol(unittest.TestCase):
    def setUp(self):
        self.rng = np.random.default_rng(7)

    def test_realized_vol_of_constant_vol_returns(self):
        r = self.rng.normal(0, 0.16 / math.sqrt(252), 5000)
        self.assertAlmostEqual(E.realized_vol(r, 5000), 16.0, delta=0.4)

    def test_annualization_is_consistent_with_calendar_window(self):
        sigma = 0.16
        days = 30 * 252 / 365   # trading days per 30 calendar days on average
        self.assertAlmostEqual(E.fair_vol(sigma**2 / 252, days), 16.0, places=9)

    def test_events_add_variance_once(self):
        base = E.fair_vol(1e-4, 21)
        self.assertGreater(E.fair_vol(1e-4, 21, events_ahead=2, event_variance=5e-5), base)

    def test_har_forecast_tracks_regime(self):
        calm = self.rng.normal(0, 0.10 / math.sqrt(252), 600)
        wild = self.rng.normal(0, 0.30 / math.sqrt(252), 60)
        r = np.concatenate([calm, wild])
        model = E.fit_har(r, horizon=21)
        f_wild = math.sqrt(model.forecast_daily_variance(r) * 252)
        f_calm = math.sqrt(model.forecast_daily_variance(calm) * 252)
        self.assertGreater(f_wild, f_calm)

    def test_event_excess_variance(self):
        r = self.rng.normal(0, 0.01, 1000)
        mask = np.zeros(1000, bool)
        mask[::20] = True
        r[mask] *= 2.0
        self.assertGreater(E.event_excess_variance(r, mask), 0)

    def test_trading_days_in_window(self):
        n = E.trading_days_between(np.datetime64('2026-10-26'), 30)
        self.assertIn(n, (21, 22))


class Outputs(unittest.TestCase):
    def test_expected_move_matches_methodology_example(self):
        self.assertAlmostEqual(E.expected_move(700, 20, 30), 40.1, delta=0.05)

    def test_edge_and_vrp(self):
        self.assertAlmostEqual(E.edge_spread(18.6, 15.2), 3.4, places=9)
        self.assertAlmostEqual(E.vrp(18.6, 15.2), 0.186**2 - 0.152**2, places=12)
        self.assertLess(E.vrp(27.4, 29.1), 0)


if __name__ == '__main__':
    unittest.main()
