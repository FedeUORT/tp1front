import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const puuid = url.searchParams.get("puuid");

	if (!puuid) {
		return new Response(JSON.stringify({ error: "Falta el PUUID" }), {
			status: 400,
		});
	}

	const API_KEY = import.meta.env.RIOT_API_KEY;

	try {
		const summonerRes = await fetch(
			`https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
			{ headers: { "X-Riot-Token": API_KEY } },
		);

		if (!summonerRes.ok) {
			return new Response(JSON.stringify({ error: "Couldn't find profile" }), {
				status: 404,
			});
		}
		const summonerData = await summonerRes.json();

		return new Response(
			JSON.stringify({
				summoner: summonerData,
			}),
			{ status: 200 },
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: "Serve error" }), {
			status: 500,
		});
	}
};
