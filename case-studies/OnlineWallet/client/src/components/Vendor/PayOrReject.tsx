import S2, { Payloads } from '../../OnlineWallet/Vendor/S2';
import { MaybePromise } from '../../OnlineWallet/Vendor/Types';

export default class PayOrReject extends S2 {
    // todo: put this into context
    pay(payload: Payloads.pay): MaybePromise<void> {
        console.log('pay')
        console.log(payload)
    }

    reject(): MaybePromise<void> {
        console.log('reject')
    }

    render() {
        return <div>
            <h2>S2: PayOrReject</h2>
        </div>
    }
}