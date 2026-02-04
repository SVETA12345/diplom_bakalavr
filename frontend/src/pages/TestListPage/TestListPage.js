import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Paper,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useStyles } from './TestListPageStyles'
import Header from '../../components/Header/Header';
import SearchIcon from '@material-ui/icons/Search';
import ShareIcon from '@material-ui/icons/Share';
import DeleteIcon from '@material-ui/icons/Delete';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddIcon from '@material-ui/icons/Add';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import TestsFilter from '../../components/TestsFilter/TestsFilter';
import { testsApi } from '../../utils/testsApi';
import { useNavigate } from 'react-router-dom';
import SnackbarCustom from '../../components/SnackbarCustom/SnackbarCustom';

const TestListPage = () => {
    const navigate = useNavigate()
  const classes = useStyles();
  const testsOriginal = useSelector(state => state.tests.tests);
  // Состояния для данных
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  // Состояния для UI
  const [subjects, setSubjects] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  

  
  // Извлечение уникальных предметов
  const extractSubjects = (testsData) => {
    const subjectsSet = new Set();
    testsData.forEach(test => {
      if (test.subject) {
        subjectsSet.add(test.subject);
      }
    });
    const subjectsList = ['Все предметы', ...Array.from(subjectsSet)];
    setSubjects(subjectsList);
  };

  // Фильтрация тестов
  const filterTests = () => {
    console.log('tests', tests)
    let filtered = [...tests];

    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        test =>
          test.name.toLowerCase().includes(query) ||
          (test.description && test.description.toLowerCase().includes(query))
      );
    }

    // Фильтр по предмету
    if (selectedSubject && selectedSubject !== 'all') {
      filtered = filtered.filter(test => test.subject === selectedSubject);
    }

    // Фильтр по дате (простая проверка на совпадение даты)
    if (dateFilter) {
      filtered = filtered.filter(test => {
        const testDate = formatDateForFilter(test.createdAt);
        return testDate === dateFilter;
      });
    }
    setFilteredTests(filtered);
  };

  // Форматирование даты для фильтра
  const formatDateForFilter = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Возвращает YYYY-MM-DD
  };

  // Форматирование даты для отображения
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };


  // Обработчики событий
  const handleTestClick = (testId) => {
    
    navigate(`/tests/${testId}`)
  };


  const handleDeleteClick = (testId, e) => {
    e.stopPropagation()
    setTestToDelete(testId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return;
    testsApi.deleteTest(testToDelete).then((data)=>{
        setTests(tests.filter(test => test._id !== testToDelete));
      setSnackbar({
        open: true,
        message: 'Тест успешно удален',
        severity: 'success',
      });
    }).catch((err)=>{
        setSnackbar({
        open: true,
        message: 'Ошибка при удалении теста',
        severity: 'error',
      })
    }).finally(()=>{
        setDeleteDialogOpen(false);
        setTestToDelete(null);
    })
    
  };

  const handleShareTest = (testId, e) => {
    e.stopPropagation();
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/test_take/${testId}`)
      .then(() => {
        setSnackbar({
          open: true,
          message:  "Ссылка скопирована в буфер обмена!",
          severity: 'success',
        });
      })
      .catch(err => {
        console.error('Ошибка копирования:', err);
      });
    // Логика генерации ссылки или QR-кода
  };


  const handleCreateTest = () => {
    navigate('/test_editor')
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setDateFilter('');
  };

  // Загрузка тестов при монтировании
  useEffect(() => {
    extractSubjects(testsOriginal)
    setTests(testsOriginal)
  }, []);

  // Фильтрация тестов при изменении фильтров
  useEffect(() => {
    if (tests.length>0){
        filterTests();
    }
    
  }, [searchQuery, selectedSubject, dateFilter, tests]);
  return (
    <>
     <Header>
                <div className="navigation">
                  <nav className="navigation__another-button">
                    <Link to="/glavnay" className="navigation__button">
                      Главная
                    </Link>
                    <Link
                      to="/lk"
                      className="navigation__button navigation__button_active"
                    >
                      Личный кабинет
                    </Link>
                  </nav>
                </div>
              </Header>
    <Box className={classes.root}>
        
      {/* Заголовок и кнопки действий */}
      <Box className={classes.header}>
        <Typography variant="h4" component="h1">
          Мои тесты
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateTest}
            size="small"
          >
            Новый тест
          </Button>
        </Box>
      </Box>

      <TestsFilter classes={classes} searchQuery={searchQuery} setSearchQuery={setSearchQuery} showFilters={showFilters} setShowFilters={setShowFilters} clearFilters={clearFilters} selectedSubject={selectedSubject} dateFilter={dateFilter} setSelectedSubject={setSelectedSubject} subjects={subjects} setDateFilter={setDateFilter}/>

      {/* Информация о результатах */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Найдено тестов: <strong>{filteredTests.length}</strong> из {tests.length}
        </Typography>
        {filteredTests.length < tests.length && (
          <Button 
            size="small" 
            onClick={clearFilters}
            variant="text"
          >
            Показать все ({tests.length})
          </Button>
        )}
      </Box>

      {/* Список тестов */}
      <Box>
        {filteredTests.length === 0 ? (
          <Paper style={{ padding: 40, textAlign: 'center' }}>
            <SearchIcon style={{ fontSize: 48, color: '#9e9e9e', marginBottom: 16 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Тесты не найдены
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
              Попробуйте изменить параметры поиска
            </Typography>
          </Paper>
        ) : (
          filteredTests.map((test) => {
            
            return (
              <Card
                key={test._id}
                className={classes.testCard}
                onClick={(e) => handleTestClick(test._id)}
              >
                <CardContent>
                  {/* Заголовок карточки */}
                  <Box className={classes.testHeader}>
                    <Box flex={1}>
                      <Typography variant="h6" className={classes.testTitle} gutterBottom>
                        {test.name}
                      </Typography>
                      {test.description && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {test.description}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={test.subject}
                        size="small"
                        style={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: '500' }}
                      />
                    </Box>
                  </Box>

                  {/* Информация о тесте */}
                  <Box className={classes.testInfo}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>{test.duration}</strong> мин
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={4} md={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>{test.passingScore}%</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      
                      
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">
                          <strong>Попыток:</strong> {test.maxAttempts || '∞'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">
                          <strong>Создан:</strong> {formatDateForDisplay(test.createdAt)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Действия */}
                  <Box className={classes.testActions}>
                    <IconButton
                      size="small"
                      title="Копировать ссылку"
                      onClick={(e) => handleShareTest(test._id, e)}
                      style={{ color: '#2e7d32' }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Удалить"
                      onClick={(e) => handleDeleteClick(test._id, e)}
                      style={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот тест? Все связанные данные будут безвозвратно удалены.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="secondary" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Снэкбар для уведомлений */}
      <SnackbarCustom setSnackbar={setSnackbar} snackbar={snackbar} />
    </Box>
    </>
  );
};

export default TestListPage;