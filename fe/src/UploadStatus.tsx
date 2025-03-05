/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button, Typography, Container, LinearProgress } from "@mui/material";

interface IUploadStatus {
  isFetching: boolean;
  handleOnFinishUpload: () => void;
}
export function UploadStatus({
  isFetching,
  handleOnFinishUpload,
}: IUploadStatus) {
  return (
    <Container maxWidth="xs" sx={{ mt: 4, textAlign: "center" }}>
      {isFetching ? (
        <>
          <Typography variant="h6" gutterBottom>
            מעלה תמונות...
          </Typography>
          <LinearProgress
            variant="indeterminate"
            sx={{
              mt: 2,
              transform: "scaleX(-1)",
            }}
          />
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            הקבצים עלו בהצלחה
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOnFinishUpload}
            fullWidth
            sx={{ mt: 2 }}
          >
            מעבר לכל התמונות
          </Button>
        </>
      )}
    </Container>
  );
}

export default UploadStatus;
