from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import typing

from codegen.automata.states import State
from codegen.automata.payloads import Payload


@dataclass
class Action(ABC):
    """Interface for an action in the EFSM. An action can either be a send or a receive."""

    role: str
    label: str
    state_id: str
    succ_id: str
    payloads: typing.List[Payload]
    succ: State = field(init=False, compare=False)

    _action_token_to_constructor: typing.ClassVar[typing.Dict[str, typing.Type['Action']]] = {}

    @classmethod
    def __init_subclass__(cls, *, action_token: str):
        """Register a type of action which uses the specified 'action_token'
        in the transition label."""

        cls._action_token_to_constructor[action_token] = cls
        return super().__init_subclass__()

    @classmethod
    def parse(cls, edge_info: dict, src_state_id: str, dst_state_id: str) -> 'Action':
        """Parse the action specified by 'action_label' (in Scribble notation) into an
        Action instance, transitioning from 'src_state_id' to 'dst_state_id'."""

        Constructor = Action._action_token_to_constructor.get(edge_info['op'])
        if not Constructor:
            raise ValueError(f'Unsupported operation: "{edge_info["op"]}"')

        payloads = [Payload(**payload_info) for payload_info in edge_info['payloads']]

        # TODO: silent vars

        return Constructor(role=edge_info['role'],
                           label=edge_info['label'],
                           state_id=src_state_id,
                           succ_id=dst_state_id,
                           payloads=payloads)

    @abstractmethod
    def add_to_efsm(self, efsm: 'EfsmBuilder'):
        """Add this Action instance to the specified 'efsm'.

        To be implemented by concrete Action classes, as they customise
        how the Action is added to the EFSM."""

        raise NotImplementedError('Action.add_to_efsm')


class SendAction(Action, action_token='!'):

    def add_to_efsm(self, efsm: 'EfsmBuilder'):
        efsm.add_action_to_send_state(self)


class ReceiveAction(Action, action_token='?'):

    def add_to_efsm(self, efsm: 'EfsmBuilder'):
        efsm.add_action_to_receive_state(self)
