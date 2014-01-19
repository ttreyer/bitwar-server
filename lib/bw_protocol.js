const MSG_TYPE_ID = 1,
			MSG_TYPE_MAP = 2,
			MSG_TYPE_ENTITIES = 3,
			MSG_TYPE_PLAYERS_INFO = 4,
			MSG_TYPE_SCORES = 5,
			MSG_TYPE_SHIPS = 6;

const MSG_HEADER_SIZE = 4,
			MSG_HEADER_OFFSET_TYPE = 0,
			MSG_HEADER_OFFSET_LENGTH = 2;

const ID_SIZE = 1,
			ID_OFFSET_ID = 0;

const MAP_HEADER_SIZE = 8,
			MAP_OFFSET_DISPLAY_WIDTH = 0,
			MAP_OFFSET_DISPLAY_HEIGHT = 2,
			MAP_OFFSET_MAP_WIDTH = 4,
			MAP_OFFSET_MAP_HEIGHT = 6,
			MAP_OFFSET_MAP_DATA = 8,
			MAP_DATA_SIZE = 1;

const ENTITY_SIZE = 8,
			ENTITY_OFFSET_PLAYER = 0,
			ENTITY_OFFSET_TEAM = 1,
			ENTITY_OFFSET_TYPE = 2,
			ENTITY_OFFSET_X = 4,
			ENTITY_OFFSET_Y = 6;

const PLAYERS_INFO_HEADER_SIZE = 4,
			PLAYERS_INFO_HEADER_OFFSET_LENGTH = 0,
			PLAYERS_INFO_PLAYER_HEADER_SIZE = 2,
			PLAYERS_INFO_PLAYER_HEADER_OFFSET_ID = 0,
			PLAYERS_INFO_PLAYER_HEADER_OFFSET_TEAM = 1,
			PLAYERS_INFO_OFFSET_NICK = 2,
			PLAYERS_INFO_NICK_EOS = 0;

const SCORE_SIZE = 8,
			SCORE_OFFSET_PLAYER = 0,
			SCORE_OFFSET_TEAM = 1,
			SCORE_OFFSET_KILL = 2,
			SCORE_OFFSET_DEATH = 4,
			SCORE_OFFSET_SCORE = 6;

const SHIPS_SIZE = 2,
			SHIPS_OFFSET_TYPE = 0;

function sizeOfMatrix (matrix) {
	var size = 0;

	for (var i = 0, l = matrix.length; i < l; i++)
		size += matrix[i].length;

	return size;
}

function newMessage (type, data) {
	var message = new Buffer(MSG_HEADER_SIZE + data.length);

	message.writeUInt16LE(type, MSG_HEADER_OFFSET_TYPE);
	message.writeUInt16LE(data.length, MSG_HEADER_OFFSET_LENGTH);

	data.copy(message, MSG_HEADER_SIZE );

	return message;
};

function encodeEntity (entity, buffer, offset) {
	var x = Math.floor(entity.pe.x + entity.ge.dx),
			y = Math.floor(entity.pe.y + entity.ge.dy);

	buffer.writeUInt8(entity.player.id, offset + ENTITY_OFFSET_PLAYER);
	buffer.writeInt8(entity.player.team, offset + ENTITY_OFFSET_TEAM);
	buffer.writeUInt16LE(entity.type, offset + ENTITY_OFFSET_TYPE);
	buffer.writeInt16LE(x, offset + ENTITY_OFFSET_X);
	buffer.writeInt16LE(y, offset + ENTITY_OFFSET_Y);
};

exports.idMessage = function (id) {
	var data = new Buffer(ID_SIZE);

	data.writeUInt8(id, ID_OFFSET_ID);

	return newMessage(MSG_TYPE_ID, data);
};

exports.mapMessage = function (map) {
	var dataOffset = 0;
			mapSize = sizeOfMatrix(map.data),
			data = new Buffer(MAP_HEADER_SIZE + mapSize);

	data.writeUInt16LE(map.width, MAP_OFFSET_DISPLAY_WIDTH);
	data.writeUInt16LE(map.height, MAP_OFFSET_DISPLAY_HEIGHT);
	data.writeUInt16LE(map.data.length, MAP_OFFSET_MAP_WIDTH);
	data.writeUInt16LE(map.data[0].length, MAP_OFFSET_MAP_HEIGHT);

	for (var i = 0, l = map.data.length; i < l; i++) {
		for (var j = 0, m = map.data[i].length; j < m; j++) {
			dataOffset = i * j * MAP_DATA_SIZE;

			data.writeInt8(map.data[i][j], MAP_OFFSET_MAP_DATA + dataOffset);
		}
	}

	return newMessage(MSG_TYPE_MAP, data);
};

exports.entitiesMessage = function (entities) {
	var data = new Buffer(entities.length * ENTITY_SIZE );

	for (var i = 0, l = entities.length; i < l; i++)
		encodeEntity(entities[i], data, i * ENTITY_SIZE);

	return newMessage(MSG_TYPE_ENTITIES, data);
};

function computePlayersBufferLength (players) {
	var length = 0;

	for (var i = 0, l = players.length; i < l; i++) {
		length += PLAYERS_INFO_PLAYER_HEADER_SIZE;
		length += players[i].nick.length + 1;
	}

	return length + PLAYERS_INFO_HEADER_SIZE;
};

exports.playersMessage = function (players) {
	var bufferLength = computePlayersBufferLength(players),
			data = new Buffer(bufferLength),
			index = PLAYERS_INFO_HEADER_SIZE;

	data.writeUInt8(players.length, PLAYERS_INFO_HEADER_OFFSET_LENGTH);
	data.writeUInt8(0, PLAYERS_INFO_HEADER_OFFSET_LENGTH + 1);
	data.writeUInt8(0, PLAYERS_INFO_HEADER_OFFSET_LENGTH + 2);
	data.writeUInt8(0, PLAYERS_INFO_HEADER_OFFSET_LENGTH + 3);

	for (var i = 0, l = players.length; i < l; i++) {
		data.writeUInt8(players[i].id, index + PLAYERS_INFO_PLAYER_HEADER_OFFSET_ID);
		data.writeInt8(players[i].team, index + PLAYERS_INFO_PLAYER_HEADER_OFFSET_TEAM);
		data.write(players[i].nick, index + PLAYERS_INFO_OFFSET_NICK, 'ascii');
		data.writeUInt8(PLAYERS_INFO_NICK_EOS, index + PLAYERS_INFO_PLAYER_HEADER_OFFSET_TEAM + players[i].nick.length + 1);

		index += PLAYERS_INFO_PLAYER_HEADER_SIZE + players[i].nick.length + 1;
	}

	return newMessage(MSG_TYPE_PLAYERS_INFO, data);
}; 

exports.scoresMessage = function (players) {
	var data = new Buffer(players.length * SCORE_SIZE),
			offset = 0;

	for (var i = 0, l = players.length; i < l; i++) {
		offset = i * SCORE_SIZE;

		data.writeUInt8(players[i].id, offset + SCORE_OFFSET_PLAYER);
		data.writeInt8(players[i].team, offset + SCORE_OFFSET_TEAM);
		data.writeInt16LE(players[i].killCounter, offset + SCORE_OFFSET_KILL);
		data.writeInt16LE(players[i].deathCounter, offset + SCORE_OFFSET_DEATH);
		data.writeInt16LE(players[i].scoreCounter, offset + SCORE_OFFSET_SCORE);
	}

	return newMessage(MSG_TYPE_SCORES, data);
};

exports.shipsMessage = function (ships) {
	var data = new Buffer(ships.length * SHIPS_SIZE);

	for (var i = 0, l = ships.length; i < l; i++) {
		data.writeUInt16LE(ships[i].type, i * SHIPS_SIZE);
	}

	return newMessage(MSG_TYPE_SHIPS, data);
};
