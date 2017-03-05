let offset: number;
let maxOffsets: number;

let minId: number;
let maxId: number;
let id: number;

const IdGenerator = {
    Init: (playerId: number, maxPlayers: number) => {
        offset = playerId;
        maxOffsets = maxPlayers + 1; // account for neutral playerId of 0

        const maxSafe = Number.MAX_SAFE_INTEGER - (Number.MAX_SAFE_INTEGER % maxOffsets);
        const range = maxSafe / maxOffsets;

        minId = 1 + range * offset;
        maxId = minId + range;
        id = minId - 1;
    },

    Next: () => {
        return (++id > maxId) ? minId : id;
    }
};

IdGenerator.Init(0, 8);

export default IdGenerator;
