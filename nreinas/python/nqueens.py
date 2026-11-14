"""N-Queens with the python-constraint library.

One variable per row: variable i is the column of the queen in row i.
The representation already keeps the queens in different rows; the
constraints keep them in different columns and diagonals.

Install:  pip install python-constraint
Run:      python3 nqueens.py 8            (one solution, written to queens8.json)
          python3 nqueens.py 8 --count    (count all solutions)
          python3 nqueens.py 200 --min-conflicts   (local search)
"""
import json
import sys
import time

from constraint import (AllDifferentConstraint, BacktrackingSolver,
                        MinConflictsSolver, Problem)


def build(n, solver=None):
    """The CSP for n queens, without searching."""
    problem = Problem(solver or BacktrackingSolver())
    rows = range(n)
    problem.addVariables(rows, range(n))           # each row gets a column
    problem.addConstraint(AllDifferentConstraint(), rows)  # different columns
    for i in rows:                                 # different diagonals
        for j in range(i + 1, n):
            problem.addConstraint(
                lambda qi, qj, d=j - i: abs(qi - qj) != d, (i, j))
    return problem


def solve(n, forwardcheck=True):
    """One solution as a list of columns, or None."""
    solution = build(n, BacktrackingSolver(forwardcheck)).getSolution()
    return [solution[i] for i in range(n)] if solution else None


def count_solutions(n):
    return len(build(n).getSolutions())


def build_pairs(n, solver=None):
    """Same CSP, written only with pairwise constraints.

    AllDifferentConstraint counts as ONE conflict no matter how many
    queens share a column, so local search cannot tell which queen is
    worse. One constraint per pair of rows gives it that information."""
    problem = Problem(solver or BacktrackingSolver())
    problem.addVariables(range(n), range(n))
    for i in range(n):
        for j in range(i + 1, n):
            problem.addConstraint(
                lambda qi, qj, d=j - i: qi != qj and abs(qi - qj) != d, (i, j))
    return problem


def solve_min_conflicts(n, steps=1000):
    """Local search: start from a full assignment and repair it.
    Returns None if it gives up after the given number of steps."""
    solution = build_pairs(n, MinConflictsSolver(steps)).getSolution()
    return [solution[i] for i in range(n)] if solution else None


def time_first(n, forwardcheck=True):
    start = time.perf_counter()
    solve(n, forwardcheck)
    return time.perf_counter() - start


def show(cols):
    for q in cols:
        print(" ".join("Q" if c == q else "." for c in range(len(cols))))


def write_json(filename, n, cols):
    # Columns are stored from 1, as in the Prolog version.
    with open(filename, "w", encoding="utf-8") as f:
        json.dump({"n": n, "solution": [c + 1 for c in cols]}, f)


def main(argv):
    if not argv or not argv[0].isdigit():
        print("Usage: python3 nqueens.py N [--count | --min-conflicts]")
        return
    n = int(argv[0])
    if "--count" in argv:
        print(f"N = {n}: {count_solutions(n)} solutions")
        return
    cols = solve_min_conflicts(n) if "--min-conflicts" in argv else solve(n)
    if cols is None:
        print(f"N = {n}: no solution found")
        return
    show(cols)
    filename = f"queens{n}.json"
    write_json(filename, n, cols)
    print(f"Wrote one solution for N = {n} to {filename}")


if __name__ == "__main__":
    main(sys.argv[1:])
