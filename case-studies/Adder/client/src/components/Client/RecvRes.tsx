import S1, { Payloads } from '../../Adder/Client/S1';
import { MaybePromise } from '../../Adder/Client/Types';
import { AdderContext } from '../../AdderContext';

export default class RecvRes extends S1 {
    RES(payload: Payloads.RES): MaybePromise<void> {
        this.context.setResult(payload.res)
    }

    render() {
        return <div>
            <h2>S1: RecvRes</h2>
        </div>
    }
}
RecvRes.contextType = AdderContext;