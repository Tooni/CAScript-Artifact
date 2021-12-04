from abc import ABC
from dataclasses import dataclass


@dataclass
class Payload(ABC):
    """A payload in the EFSM."""

    name: str
    sort: str
