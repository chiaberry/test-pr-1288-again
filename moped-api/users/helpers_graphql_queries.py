#
# GraphQL to manage the creation of users.
# It does not upsert, if there is an error it should stop.
#
GRAPHQL_CRATE_USER = """
    mutation insert_moped_user($users: [moped_users_insert_input!]!) {
      insert_moped_users(objects: $users) {
        affected_rows
      }
    }
"""

#
# GraphQL query to update an existing user
#
GRAPHQL_UPDATE_USER = """
    mutation update_moped_user($userBoolExp: moped_users_bool_exp!, $user: moped_users_set_input) {
      update_moped_users(where: $userBoolExp, _set: $user) {
        affected_rows
      }
    }
"""


GRAPHQL_DEACTIVATE_USER = """
    mutation update_moped_user($userBoolExp: moped_users_bool_exp!) {
      update_moped_users(where: $userBoolExp, _set: { status_id: 0 }) {
        affected_rows
      }
    }
"""