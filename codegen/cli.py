from argparse import ArgumentParser
import typing
import json

from codegen.automata import Endpoint, parser as automata_parser
from codegen.generator import CodeGenerator
from codegen.utils import logger, role_parser, nuscr, type_declaration_parser, pragma_parser


def parse_arguments(args: typing.List[str]) -> typing.Dict:
    """Prepare command line argument parser and return the parsed arguments
    from the specified 'args'."""

    parser = ArgumentParser()

    parser.add_argument('filename',
                        type=str, help='Path to Scribble protocol')

    parser.add_argument('protocol',
                        type=str, help='Name of protocol')

    parser.add_argument('role',
                        type=str, help='Role to project')

    parser.add_argument('target',
                        choices=['node', 'browser'], help='Code generation target')

    parser.add_argument('-s', '--server',
                        type=str, help='Server role (only applicable for browser targets)')

    parser.add_argument('-o', '--output',
                        type=str, help='Output directory for generation')

    parser.add_argument('--prettify', dest='prettify', action='store_true',
                        help="Used by default. States that tsfmt should be used to format the files.")
    parser.add_argument('--no-prettify', dest='prettify', action='store_false',
                        help='States that tsfmt should not be used to format the files.')
    parser.set_defaults(prettify=True)

    parser.add_argument('--no-pass', dest='pass_forall', action='store_false',
                        help="Used by default. States that the Pass-∀ rule should not be used.")
    parser.add_argument('--pass', dest='pass_forall', action='store_true',
                        help='States that the Pass-∀ rule should be used.')
    parser.set_defaults(pass_forall=False)

    parsed_args = parser.parse_args(args)
    return vars(parsed_args)


def main(args: typing.List[str]) -> int:
    """Main entry point, return exit code."""

    parsed_args = parse_arguments(args)

    target = parsed_args['target']
    server = parsed_args['server']
    role = parsed_args['role']
    protocol = parsed_args['protocol']
    output_dir = parsed_args['output']
    scribble_filename = parsed_args['filename']
    prettify = parsed_args['prettify']
    pass_forall = parsed_args['pass_forall']

    # 'server' flag must be provided if the codegen target is the browser.
    if target == 'browser' and server is None:
        logger.ERROR('target==browser, so the following arguments are required: server')
        return 1

    if target == 'browser' and server == role:
        logger.ERROR('Browser role cannot be the server role.')
        return 1

    missing_pragmas = pragma_parser.find_missing_pragmas(scribble_filename)
    if len(missing_pragmas) != 0:
        logger.ERROR(f"{scribble_filename} was missing the following pragmas: {missing_pragmas}")
        logger.INFO("Try adding them at the top of the file with: " +
                    "(*# CheckDirectedChoiceDisabled #*)")
        return 1

    all_roles = role_parser.parse(scribble_filename, protocol)
    other_roles = all_roles - set([role])

    if role not in all_roles:
        logger.ERROR(f"Could not find role {role} in protocol {protocol} of {scribble_filename}")
        return 1

    try:
        phase = f'Parse FSM from {scribble_filename}, {"without " if not pass_forall else ""}using the Pass-∀ rule. '
        if pass_forall:
            logger.INFO('Since you have Pass-∀ enabled, certain protocols will make this generation hang.')
        with type_declaration_parser.parse(scribble_filename) as custom_types:
            exit_code, output = nuscr.get_graph(scribble_filename, protocol, role, server)
            if exit_code != 0:
                logger.FAIL(phase)
                logger.ERROR(output)
                logger.INFO("You may need to remove 'module' lines, e.g. 'module Calculator;'.")
                return exit_code
            logger.SUCCESS(phase)
    except (OSError, ValueError) as error:
        logger.ERROR(error)
        return 1

    output_split = output.split("graph:")
    output_json = json.loads(output_split[0])
    dot = output_split[1]

    mandatory_roles = output_json["mandatory"]

    if server is None:
        mandatory_roles.remove(role)
    elif server in mandatory_roles:
        mandatory_roles.remove(server)

    edges = output_json["edges"]

    phase = f'Parse endpoint IR from Scribble output'
    try:
        efsm = automata_parser.from_data(dot, edges)
        logger.SUCCESS(phase)
    except ValueError as error:
        logger.FAIL(phase)
        logger.ERROR(error)
        return 1

    endpoint = Endpoint(protocol=protocol,
                        role=role,
                        other_roles=other_roles,
                        mandatory_roles=mandatory_roles,
                        server=server,
                        efsm=efsm,
                        types=custom_types)

    codegen = CodeGenerator(target=target, output_dir=output_dir)
    phase = f'Generate all {target} artifacts in {codegen.output_dir}'
    try:
        exit_code = codegen.generate(endpoint, prettify)
        if exit_code != 0:
            logger.FAIL(phase)
        else:
            logger.SUCCESS(phase)

        return exit_code
    except Exception as error:
        logger.FAIL(phase)
        logger.ERROR(error)
        return 1
