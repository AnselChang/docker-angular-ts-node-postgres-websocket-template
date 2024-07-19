import { queryDB } from ".";
import { DBUser } from "../../shared/models/db-user";
import { FriendStatus } from "../../shared/models/friends";


// find a user by matching username and return the user
export async function queryUserByUserID(userid: string): Promise<DBUser | undefined> {

  // make a SQL query to get the user with the specified username
  const query = `SELECT * FROM users WHERE userid = $1`;
  const result = await queryDB(query, [userid]);

  if (result.rows.length === 0) {
    return undefined;
  }

  const rawUser = result.rows[0];
  return {
    userid: rawUser.userid,
    username: rawUser.username,
    lastOnline: rawUser.last_online,
    trophies: rawUser.trophies,
    xp: rawUser.xp,
    puzzleElo: rawUser.puzzle_elo,
    highestPuzzleElo: rawUser.highest_puzzle_elo
  };
}

// get the list of friends, pending friends, and incoming friend requests for a user
// user-relationship table has schema (username1, username2, type = "friends" | "1_send_to_2" | "2_send_to_1")
// join to get the trophies and xp for each friend
export async function queryFriendsAndFriendRequestsForUser(userid: string): Promise<{
  userid: string;
  username: string;
  trophies: number;
  xp: number;
  type: FriendStatus;
}[]> {

  // subquery that gets the friends, pending friends, and incoming friend requests from user1
  // if type is "friends", then set to "friends"
  // if type is "1_send_to_2", then set to "outgoing", if type is "2_send_to_1", then set to "incoming"
  const subquery = `
    SELECT userid2 as userid, 
    CASE
      WHEN type = '1_send_to_2' THEN 'outgoing'
      WHEN type = '2_send_to_1' THEN 'incoming'
      ELSE type
    END as type
    FROM user_relationships
    WHERE userid1 = $1
  `;

  // subquery that gets the friends, pending friends, and incoming friend requests from user2
  // if type is "friends", then set to "friends"
  // if type is "1_send_to_2", then set to "incoming", if type is "2_send_to_1", then set to "outgoing"
  const subquery2 = `
    SELECT userid1 as userid, 
    CASE
      WHEN type = '1_send_to_2' THEN 'incoming'
      WHEN type = '2_send_to_1' THEN 'outgoing'
      ELSE type
    END as type
    FROM user_relationships
    WHERE userid2 = $1
  `;

  // make a SQL query that gets the username, trophies, xp, and type of relationship for each friend
  const query = `
    SELECT users.userid, users.username, users.trophies, users.xp, subquery.type
    FROM users
    JOIN (${subquery} UNION ${subquery2}) as subquery
    ON users.userid = subquery.userid
  `;

  const result = await queryDB(query, [userid]);
  return result.rows;
}

// returns a list of full friends for a user as a list of strings
export async function queryFriendUserIDsForUser(userid: string): Promise<string[]> {
  const query = `
    SELECT userid2 as userid
    FROM user_relationships
    WHERE userid1 = $1 AND type = 'friends'
    UNION
    SELECT userid1 as userid
    FROM user_relationships
    WHERE userid2 = $1 AND type = 'friends'
  `;
  const result = await queryDB(query, [userid]);
  return result.rows.map((row) => row.userid);
}

// returns a list of all usernames in the database that match the pattern, sort alphabetically
export async function queryAllUsernamesMatchingPattern(pattern: string = "%"): Promise<string[]> {
  const query = `SELECT username FROM users WHERE username LIKE $1 ORDER BY username`;
  const result = await queryDB(query, [pattern]);
  return result.rows.map((row) => row.username);
}

export async function createUser(userid: string, username: string): Promise<void> {
  const query = `INSERT INTO users (userid, username) VALUES ($1, $2)`;
  await queryDB(query, [userid, username]);
}

export async function fetchUsernameFromUserID(userid: string): Promise<string> {
  const query = `SELECT username FROM users WHERE userid = $1`;
  const result = await queryDB(query, [userid]);
  return result.rows[0].username;
}