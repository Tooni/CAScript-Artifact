import sys


def INFO(*args):
    print('| INFO:', *args, file=sys.stdout)


def ERROR(*args):
    print('| ERROR:', *args, file=sys.stderr)


def SUCCESS(*args):
    print('✔', *args, file=sys.stdout)


def FAIL(*args):
    print('✘', *args, file=sys.stdout)
