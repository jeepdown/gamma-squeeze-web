"""End-to-end: synthetic chains + price history in a temp folder -> run.symbol_snapshot."""
import json
import math
import sys
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run  # noqa: E402
from test_engine import bs  # noqa: E402


class Snapshot(unittest.TestCase):
    def test_snapshot_from_files(self):
        asof = date(2026, 10, 26)
        with tempfile.TemporaryDirectory() as d:
            folder = Path(d) / 'SPY'; folder.mkdir()
            spot, r, vol = 671.0, 0.04, 0.17
            for days in (23, 37):
                t = days / 365
                with open(folder / f'chain_{(asof + timedelta(days=days)).isoformat()}.csv', 'w') as f:
                    f.write('strike,call_bid,call_ask,put_bid,put_ask\n')
                    for k in np.arange(450, 900, 1.0):
                        c, p = bs(spot, k, t, r, vol, True), bs(spot, k, t, r, vol, False)
                        f.write(f'{k},{max(c - .01, 0) if c > .02 else 0},{c + .01},{max(p - .01, 0) if p > .02 else 0},{p + .01}\n')
            rng = np.random.default_rng(1)
            px = spot * np.exp(np.cumsum(rng.normal(0, 0.13 / math.sqrt(252), 400)))
            px = px * spot / px[-1]
            start = asof - timedelta(days=600)
            with open(folder / 'prices.csv', 'w') as f:
                f.write('date,close\n')
                for i, p in enumerate(px):
                    f.write(f'{(start + timedelta(days=i)).isoformat()},{p}\n')
            (folder / 'meta.json').write_text(json.dumps({'spot': spot, 'rate': r, 'dividends': []}))
            snap = run.symbol_snapshot(folder, asof, [(asof + timedelta(days=12), 'CPI')])
        self.assertAlmostEqual(snap['oei'], 17.0, delta=0.3)
        self.assertTrue(8 < snap['fair_vol'] < 20)
        self.assertAlmostEqual(snap['edge_spread'], snap['oei'] - snap['fair_vol'], delta=0.02)
        self.assertEqual(len(snap['events_ahead']), 1)
        self.assertAlmostEqual(snap['expected_move_30d'], spot * snap['oei'] / 100 * math.sqrt(30 / 365), delta=0.1)


if __name__ == '__main__':
    unittest.main()
