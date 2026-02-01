import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core';
const ModalStatus =({titleDialog, openDialog, handleCloseDialog, dialogMessage}) =>{
    return (
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{titleDialog}</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>)
}

export default ModalStatus;