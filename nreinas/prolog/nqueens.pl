/*  N-Queens with constraint logic programming over finite domains.

    One variable per row: Cols = [Q1, ..., QN], where Qi is the column
    of the queen in row i. The representation already keeps the queens
    in different rows; the constraints keep them in different columns
    and diagonals.

    Run from the command line (one solution, written to queens8.json):
        swipl -q nqueens.pl 8

    Or load it and query (no N opens the toplevel):
        swipl nqueens.pl
        ?- queens(8, Cols).
        ?- count_solutions(8, Count).
        ?- time_first(30, ff).
*/
:- use_module(library(clpfd)).
:- use_module(library(http/json)).

:- initialization(main, main).

%   queens(+N, -Cols): one solution, searching with first-fail.
queens(N, Cols) :-
    queens(N, Cols, [ff]).

%   queens(+N, -Cols, +Options): Options are labeling options,
%   e.g. [leftmost] (the default order) or [ff] (first-fail).
queens(N, Cols, Options) :-
    constrain(N, Cols),
    labeling(Options, Cols).

%   constrain(+N, -Cols): the CSP, without searching.
constrain(N, Cols) :-
    length(Cols, N),                  % one variable per row
    Cols ins 1..N,                    % each one is a column
    all_different(Cols),              % different columns
    numlist(1, N, Rows),
    maplist(sum_with_index, Cols, Rows, Sums),
    maplist(diff_with_index, Cols, Rows, Diffs),
    all_different(Sums),              % different / diagonals
    all_different(Diffs).             % different \ diagonals

sum_with_index(Q, I, S)  :- S #= Q + I.
diff_with_index(Q, I, D) :- D #= Q - I.

%   count_solutions(+N, -Count): how many solutions there are.
count_solutions(N, Count) :-
    aggregate_all(count, queens(N, _, [leftmost]), Count).

%   time_first(+N, +Option): time to the first solution with one
%   labeling option (leftmost, ff, ...).
time_first(N, Option) :-
    statistics(cputime, T0),
    statistics(inferences, I0),
    once(queens(N, _, [Option])),
    statistics(cputime, T1),
    statistics(inferences, I1),
    T is T1 - T0, I is I1 - I0,
    format("N = ~w, ~w: ~3f s, ~D inferences~n", [N, Option, T, I]).

%   show(+Cols): print the board.
show(Cols) :-
    length(Cols, N),
    forall(member(Q, Cols),
           ( forall(between(1, N, C), (C =:= Q -> write(' Q') ; write(' .'))), nl )).

%   write_json(+File, +N, +Cols)
write_json(File, N, Cols) :-
    Dict = _{n: N, solution: Cols},
    setup_call_cleanup(
        open(File, write, S, [encoding(utf8)]),
        json_write_dict(S, Dict, [width(0)]),
        close(S)).

main([]) :- !,                         % no N: open the interactive toplevel
    format("Loaded. Try ?- queens(8, Cols).~n"),
    prolog.
main(Argv) :-
    (   Argv = [NAtom|_], atom_number(NAtom, N), N >= 1
    ->  (   queens(N, Cols)
        ->  show(Cols),
            format(atom(File), 'queens~w.json', [N]),
            write_json(File, N, Cols),
            format("Wrote one solution for N = ~w to ~w~n", [N, File])
        ;   format("N = ~w has no solution~n", [N])
        )
    ;   format("Usage: swipl -q nqueens.pl N~n")
    ).
