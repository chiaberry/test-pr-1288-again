from moto import mock_cognitoidp
import boto3, os, json, pytest
from tests.test_app import TestApp
from unittest.mock import patch, Mock
from users.helpers import is_valid_user, has_user_role
from config import api_config


def create_user_claims():
    return {
        "email": "@austintexas.gov",
        "cognito:username": "test_user",
        "https://hasura.io/jwt/claims": {
            "x-hasura-user-id": "test",
            "x-hasura-default-role": "user",
            "x-hasura-allowed-roles": ["user", "admin"],
        },
        "email_verified": True,
        "aud": "test_aud",
    }


mock_users = [
    {"email": "neo@test.test", "temp_password": "test123"},
    {"email": "morpheus@test.test", "temp_password": "test123"},
]


@pytest.fixture(scope="function")
def aws_credentials():
    """Mock credentials for moto"""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


@pytest.fixture(scope="function")
def cognito(aws_credentials):
    with mock_cognitoidp():
        yield boto3.client("cognito-idp")


def create_user_pool(cognito):
    cognito_response = cognito.create_user_pool(PoolName="test_pool")
    user_pool_id = cognito_response["UserPool"]["Id"]

    # Add mock users to pool
    for user in mock_users:
        cognito.admin_create_user(
            UserPoolId=user_pool_id,
            Username=user["email"],
            TemporaryPassword=user["temp_password"],
        )

    return user_pool_id


class TestUsers(TestApp):
    def test_is_valid_user(self):
        """Test valid user attributes in JWT payload."""
        mock_jwt_payload = Mock()
        mock_jwt_payload._get_current_object = Mock(return_value=create_user_claims())

        result = is_valid_user(mock_jwt_payload)

        assert result is True

    def test_is_invalid_user_email(self):
        """Test invalid user email in JWT payload."""
        user_with_invalid_email = create_user_claims()
        user_with_invalid_email["email"] = "@gmail.com"

        mock_jwt = Mock()
        mock_jwt._get_current_object = Mock(return_value=user_with_invalid_email)

        result = is_valid_user(mock_jwt)

        assert result is False

    def test_is_invalid_user_roles(self):
        """Test invalid user (no roles) in JWT payload."""
        user_with_no_roles = create_user_claims()
        user_with_no_roles.pop("https://hasura.io/jwt/claims", None)

        mock_jwt = Mock()
        mock_jwt._get_current_object = Mock(return_value=user_with_no_roles)

        result = is_valid_user(mock_jwt)

        assert result is False

    def test_has_user_role_true(self):
        """Test user roles check in JWT claims (has role)."""
        result = has_user_role("user", create_user_claims())

        assert result is True

    def test_has_user_role_false(self):
        """Test user roles check in JWT claims (does not have role)."""
        result = has_user_role("hacker", create_user_claims())

        assert result is False

    @mock_cognitoidp
    def test_gets_users_no_auth(self):
        """Get users with no auth."""
        response = self.client.get("/users/")
        response_dict = self.parse_response(response.data)

        assert isinstance(response_dict, dict)
        assert "description" in response_dict
        assert "error" in response_dict
        assert (
            "Request does not contain a well-formed access token"
            in response_dict.get("description", "")
        )
        assert "Authorization Required" in response_dict.get("error", "")

    @patch("flask_cognito._cognito_auth_required")
    @patch("users.users.is_valid_user")
    def test_gets_users(self, mock_cognito_auth_required, mock_is_valid_user, cognito):
        """Get users."""
        mock_is_valid_user.return_value = True

        # Mock user pool
        user_pool_id = create_user_pool(cognito)

        # Patch the user pool id with the mock pool id
        patcher = patch("users.users.USER_POOL", new=user_pool_id)
        patcher.start()

        response = self.client.get("/users/")
        response_list = self.parse_response(response.data)

        assert isinstance(response_list, list)
        assert len(response_list) is len(mock_users)
        assert "Username" in response_list[0]
        assert "UserCreateDate" in response_list[0]

    @mock_cognitoidp
    def test_gets_user_no_auth(self):
        """Get user with no auth."""
        response = self.client.get("/users/test123")
        response_dict = self.parse_response(response.data)

        assert isinstance(response_dict, dict)
        assert "description" in response_dict
        assert "error" in response_dict
        assert (
            "Request does not contain a well-formed access token"
            in response_dict.get("description", "")
        )
        assert "Authorization Required" in response_dict.get("error", "")

    @mock_cognitoidp
    def test_creates_user_no_auth(self):
        """Create user with no auth."""
        response = self.client.post("/users/")
        response_dict = self.parse_response(response.data)

        assert isinstance(response_dict, dict)
        assert "description" in response_dict
        assert "error" in response_dict
        assert (
            "Request does not contain a well-formed access token"
            in response_dict.get("description", "")
        )
        assert "Authorization Required" in response_dict.get("error", "")

    @mock_cognitoidp
    def test_edits_user_no_auth(self):
        """Edit user with no auth."""
        response = self.client.put("/users/test123")
        response_dict = self.parse_response(response.data)

        assert isinstance(response_dict, dict)
        assert "description" in response_dict
        assert "error" in response_dict
        assert (
            "Request does not contain a well-formed access token"
            in response_dict.get("description", "")
        )
        assert "Authorization Required" in response_dict.get("error", "")

    @mock_cognitoidp
    def test_deletes_user_no_auth(self):
        """Delete user with no auth."""
        response = self.client.delete("/users/test123")
        response_dict = self.parse_response(response.data)

        assert isinstance(response_dict, dict)
        assert "description" in response_dict
        assert "error" in response_dict
        assert (
            "Request does not contain a well-formed access token"
            in response_dict.get("description", "")
        )
        assert "Authorization Required" in response_dict.get("error", "")
