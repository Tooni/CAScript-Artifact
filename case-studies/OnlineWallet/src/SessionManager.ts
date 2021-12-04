
type SessionState = {
    tries: number
}
const SessionStore = new Map<string, SessionState>();

function makeTry(sessionId: string): void {
    const currTries = SessionStore.get(sessionId)!.tries;
    SessionStore.set(sessionId, { tries: currTries + 1 });
}

function getNumTries(sessionId: string): number {
    return SessionStore.get(sessionId)!.tries;
}

function initSession(sessionId: string): void {
    SessionStore.set(sessionId, { tries: 0 });
}

function deleteSession(sessionId: string): void {
    SessionStore.delete(sessionId);
}

const statefulSessionLogic = {
    makeTry,
    getNumTries,
    initSession,
    deleteSession
};
export default statefulSessionLogic;