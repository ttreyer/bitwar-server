module.exports = {
	wss: {
		host: '0.0.0.0',
		port: 55455
	},
	map: {
		width: 800,
		height: 600,
		data: [[0]]
	},
	game: {
		type: 'tdm',
		time: 600,
		max_players: 16,
		team: true,
		max_team: 2
	},
	game_tdm: {
		type: 'tdm',
		team: true,
		max_team: 4
	},
	game_dm: {
		type: 'tdm',
		team:true,
		max_team: 10,
	},
	game_as: {
		type: 'as',
		time: 600,
		team: true,
		max_team: 2
	},
	ships: [
		'alpha',
		'beta',
		'gamma',
		'delta'
	]
}
