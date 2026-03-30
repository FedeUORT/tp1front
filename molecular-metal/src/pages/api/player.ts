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
		else {
			const accountData = await accountRes.json();
			const puuid = accountData.puuid;
			return new Response(
				JSON.stringify({ name: gameName, tag: tagLine, puuid: puuid }),
				{ status: 200 },
			);
		}
	} catch (error) {
		return new Response(JSON.stringify({ error: "Error de servidor" }), {
			status: 500,
		});
	}
};
