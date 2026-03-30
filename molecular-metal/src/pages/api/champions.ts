import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const puuid = url.searchParams.get("puuid");

	if (!puuid) {
		return new Response(JSON.stringify({ error: "The puuid is missing" }), {
			status: 400,
		});
	}

	const API_KEY = import.meta.env.RIOT_API_KEY;

	try {
		const masteryRes = await fetch(
			`https://la2.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
			{ headers: { "X-Riot-Token": API_KEY } },
		);

		if (!masteryRes.ok) {
			return new Response(JSON.stringify({ error: "Couldn't get masteries" }), {
				status: 404,
			});
		}

		const masteryData = await masteryRes.json();

		const top10 = masteryData.slice(0, 10);

		return new Response(JSON.stringify(top10), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: "Server error" }), {
			status: 500,
		});
	}
};
