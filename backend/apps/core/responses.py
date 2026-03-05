from rest_framework.response import Response
from rest_framework import status

class StandardResponse(Response):
    """
    A standardized response format for all API endpoints.
    Ensures that every response has a 'success', 'message', and 'data' (or 'error') key.
    """
    def __init__(self, data=None, message="", status_code=status.HTTP_200_OK, success=True, errors=None, **kwargs):
        response_data = {
            "success": success,
            "message": message,
            "data": data if success else None,
            "errors": errors if not success else None,
        }
        super().__init__(data=response_data, status=status_code, **kwargs)

    @classmethod
    def success(cls, data=None, message="Operation successful", status_code=status.HTTP_200_OK):
        return cls(data=data, message=message, status_code=status_code, success=True)

    @classmethod
    def error(cls, message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        return cls(message=message, errors=errors, status_code=status_code, success=False)
