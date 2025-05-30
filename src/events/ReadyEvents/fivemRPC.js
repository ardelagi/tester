const fetch = require('node-fetch');

async function updateRPC(client) {
    try {
        const resPlayers = await fetch('http://123.123.123.123:30120/players.json');
        const resDynamic = await fetch('http://123.123.123.123:30120/dynamic.json');

        const players = await resPlayers.json();
        const dynamic = await resDynamic.json();

        const playerCount = players.length;
        const maxPlayers = dynamic.sv_maxclients;
        const hostname = dynamic.hostname;

        client.user.setActivity(`[${playerCount}/${maxPlayers}] on ${hostname}`, {
            type: 3 // Watching
        });

    } catch (err) {
        console.error("❌ Gagal ambil data FiveM:", err);
        client.user.setActivity(`Server Offline`, {
            type: 3
        });
    }
}

module.exports = updateRPC;