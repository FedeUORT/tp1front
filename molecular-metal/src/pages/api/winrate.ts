import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const gameName = url.searchParams.get("name");
	const tagLine = url.searchParams.get("tag");

	if (!gameName || !tagLine) {
		return new Response(JSON.stringify({ error: "Faltan datos" }), {
			status: 400,
		});
	}

	const API_KEY = import.meta.env.RIOT_API_KEY;

	try {
		const accountRes = await fetch(
			`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
			{
				headers: { "X-Riot-Token": API_KEY },
			},
		);

		if (!accountRes.ok)
			return new Response(JSON.stringify({ error: "Jugador no encontrado" }), {
				status: 404,
			});
		const accountData = await accountRes.json();
		const puuid = accountData.puuid;

		const matchesRes = await fetch(
			`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
			{
				headers: { "X-Riot-Token": API_KEY },
			},
		);
		const matchIds = await matchesRes.json();

		const matchPromises = matchIds.map((matchId: string) => {
			return fetch(
				`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
				{
					headers: { "X-Riot-Token": API_KEY },
				},
			).then((res) => res.json());
		});

		const matchesData = await Promise.all(matchPromises);

		let wins = 0;
		let losses = 0;

		matchesData.forEach((match: any) => {
			if (match.info && match.info.participants) {
				const player = match.info.participants.find(
					(p: any) => p.puuid === puuid,
				);

				if (player) {
					if (player.win) {
						wins++;
					} else {
						losses++;
					}
				}
			}
		});

		const totalGames = wins + losses;
		let winrate = 0;
		if (totalGames > 0) {
			winrate = (wins / totalGames) * 100;
		}

		return new Response(
			JSON.stringify({
				jugador: `${gameName}#${tagLine}`,
				victorias: wins,
				derrotas: losses,
				totalJugadas: totalGames,
				winrate: winrate.toFixed(1) + "%",
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: "Error de servidor" }), {
			status: 500,
		});
	}
};
