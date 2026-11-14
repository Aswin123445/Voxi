from fastapi import status, HTTPException
class InterviewNotFoundException(HTTPException):

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found"
        )


from fastapi import HTTPException, status


class InvalidInterviewStatusException(HTTPException):
    def __init__(self, detail: str = "Invalid interview status"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class InvalidInterviewStageException(HTTPException):
    def __init__(self, detail: str = "Invalid interview stage"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
