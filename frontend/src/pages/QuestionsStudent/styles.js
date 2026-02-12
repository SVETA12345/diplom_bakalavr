import { makeStyles } from '@material-ui/core/styles';
export const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  questionCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  optionsContainer: {
    marginTop: theme.spacing(2),
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  timer: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    zIndex: 1000,
    boxShadow: theme.shadows[2],
  },
  requiredIndicator: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(1),
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(1),
    fontWeight: 'bold',
  },
  questionNavButton: {
    minWidth: '40px',
    position: 'relative',
  },
  unansweredDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.error.main,
  },
}));
