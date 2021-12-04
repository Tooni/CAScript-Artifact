import re
from pathlib import Path
import typing

_REQUIRED_PRAGMAS = set(("CheckDirectedChoiceDisabled",))


def find_missing_pragmas(filename: str) -> typing.Iterable[str]:
    content = Path(filename).read_text()

    pattern = re.compile(fr'\(\*\#(?P<pragmas>.*?)\#\*\)')
    matcher = re.search(pattern, content)
    if not matcher:
        return _REQUIRED_PRAGMAS
    unparsed_pragmas = matcher.groupdict()['pragmas']
    pragmas = set(pragma.strip() for pragma in unparsed_pragmas.split(','))

    return _REQUIRED_PRAGMAS.difference(pragmas)
