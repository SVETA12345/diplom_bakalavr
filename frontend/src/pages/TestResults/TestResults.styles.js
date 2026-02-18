import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(4),
    position: 'relative',
  },
  scoreCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  scoreValue: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginRight: theme.spacing(2),
  },
  resultBadge: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(1, 2),
    fontSize: '1.1rem',
  },
  questionCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    position: 'relative',
    borderLeft: `6px solid ${theme.palette.grey[300]}`,
  },
  questionCardCorrect: {
    borderLeftColor: theme.palette.success.main,
  },
  questionCardIncorrect: {
    borderLeftColor: theme.palette.error.main,
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  pointsChip: {
    marginLeft: theme.spacing(1),
  },
  userAnswer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
  },
  correctAnswer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.success.light,
    borderRadius: theme.shape.borderRadius,
  },
  explanationBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.info.light,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.info.contrastText,
  },
  expandButton: {
    marginLeft: theme.spacing(1),
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  statsGrid: {
    marginBottom: theme.spacing(4),
  },
  statItem: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  statLabel: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  progressSection: {
    marginBottom: theme.spacing(3),
  },
  attemptInfo: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  correctOption: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  incorrectOption: {
    color: theme.palette.error.main,
    textDecoration: 'line-through',
  },
  userSelectedOption: {
    backgroundColor: theme.palette.action.selected,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
  },
  questionNavButton: {
    minWidth: '40px',
    margin: theme.spacing(0.5),
  },
}));