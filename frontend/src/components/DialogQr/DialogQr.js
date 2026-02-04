
import FileCopyIcon  from '@material-ui/icons/FileCopy';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions} from "@material-ui/core";
import { Button, Typography, Box } from "@material-ui/core";
const DialogQr = ({openDialogLink, setOpenDialogLink, testUrl, qrCode, setSnackbar}) => {
      // Копирование ссылки в буфер обмена
  const handleCopyLink = () => {
    navigator.clipboard.writeText(testUrl)
      .then(() => {
        setSnackbar({
            open: true,
            message: "Ссылка скопирована в буфер обмена!",
            severity: 'success',
        })
      })
      .catch(err => {
        console.error('Ошибка копирования:', err);
      });
  };
    return(
        <Dialog open={openDialogLink} onClose={() => setOpenDialogLink(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>
                    Ссылка на тест
                  </DialogTitle>
                  
                  <DialogContent>
                    {qrCode && (
                      <Box display="flex" justifyContent="center" mb={3}>
                        <QRCodeSVG value={testUrl} size={200} />
                      </Box>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Ссылка для прохождения теста:
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          backgroundColor: '#f5f5f5',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          flexGrow: 1,
                          wordBreak: 'break-all'
                        }}
                      >
                        {testUrl}
                      </Typography>
                      
                      <IconButton onClick={handleCopyLink} size="small">
                        <FileCopyIcon  />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Отправьте эту ссылку студентам или используйте QR-код
                    </Typography>
                  </DialogContent>
                  
                  <DialogActions>
                    
                    <Button onClick={() => setOpenDialogLink(false)}>
                      Закрыть
                    </Button>
                  </DialogActions>
                </Dialog>
    )
}

export default DialogQr;