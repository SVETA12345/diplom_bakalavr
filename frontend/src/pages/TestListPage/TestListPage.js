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
  Tab,
  Tabs
} from '@material-ui/core';
import { useStyles } from './TestListPageStyles'
import Header from '../../components/Header/Header';
import SearchIcon from '@material-ui/icons/Search';
import ShareIcon from '@material-ui/icons/Share';
import DeleteIcon from '@material-ui/icons/Delete';
import AssessmentIcon from '@material-ui/icons/Assessment';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddIcon from '@material-ui/icons/Add';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import TestsFilter from '../../components/TestsFilter/TestsFilter';
import { testsApi } from '../../utils/testsApi';
import { surveysApi } from '../../utils/surveysApi';
import { useNavigate } from 'react-router-dom';
import SnackbarCustom from '../../components/SnackbarCustom/SnackbarCustom';

const TestListPage = () => {
    const navigate = useNavigate();
    const classes = useStyles();
    
    // Новое состояние для типа контента
    const [contentType, setContentType] = useState('tests'); // 'tests' или 'surveys'
    
    // Получаем данные из Redux
    const testsOriginal = useSelector(state => state.tests.tests);
    const surveysOriginal = useSelector(state => {
      return state.surveys.surveys || []});
    
    // Состояния для данных
    const [items, setItems] = useState([]); // универсальное название
    const [filteredItems, setFilteredItems] = useState([]);
    
    // Состояния для фильтров
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    
    // Состояния для UI
    const [subjects, setSubjects] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });
    
    // Получение текущих данных в зависимости от типа
    const getCurrentData = () => {
        return contentType === 'tests' ? testsOriginal : surveysOriginal;
    };

    // Получение API для текущего типа
    const getCurrentApi = () => {
        return contentType === 'tests' ? testsApi : surveysApi;
    };

    

    // Фильтрация элементов
    const filterItems = () => {
        
        let filtered = [...items];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.name.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query))
            );
        }

        if (selectedSubject && selectedSubject !== 'all') {
            filtered = filtered.filter(item => item.subject === selectedSubject);
        }

        if (dateFilter) {
            filtered = filtered.filter(item => {
                const itemDate = formatDateForFilter(item.createdAt);
                return itemDate === dateFilter;
            });
        }
        setFilteredItems(filtered);
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
    // Обработчик переключения типа
    const handleContentTypeChange = (event, newValue) => {
      
        setContentType(newValue);
        clearFilters();
    };

    // Обработчики событий
    const handleItemClick = (itemId) => {
        const route = contentType === 'tests' 
            ? `/tests/${itemId}` 
            : `/surveys/${itemId}`;
        navigate(route);
    };

    const handleDeleteClick = (itemId, e) => {
        e.stopPropagation();
        setItemToDelete(itemId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        
        const api = getCurrentApi();
        const deleteMethod = contentType === 'tests' 
            ? api.deleteTest 
            : api.deleteSurvey;
        
        deleteMethod(itemToDelete).then((data) => {
            setItems(items.filter(item => item._id !== itemToDelete));
            setSnackbar({
                open: true,
                message: `${contentType === 'tests' ? 'Тест' : 'Анкета'} успешно удален${contentType === 'tests' ? '' : 'а'}`,
                severity: 'success',
            });
        }).catch((err) => {
            setSnackbar({
                open: true,
                message: `Ошибка при удалении ${contentType === 'tests' ? 'теста' : 'анкеты'}`,
                severity: 'error',
            });
        }).finally(() => {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        });
    };

    const handleShareItem = (itemId, e) => {
        e.stopPropagation();
        const origin = window.location.origin;
        const path = contentType === 'tests' 
            ? `/test_take/${itemId}` 
            : `/survey_take/${itemId}`;
        
        navigator.clipboard.writeText(`${origin}${path}`)
            .then(() => {
                setSnackbar({
                    open: true,
                    message: "Ссылка скопирована в буфер обмена!",
                    severity: 'success',
                });
            })
            .catch(err => {
                console.error('Ошибка копирования:', err);
            });
    };

    const handleCreateItem = () => {
        const route = contentType === 'tests' 
            ? '/test_editor' 
            : '/survey_editor';
        navigate(route);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSubject('all');
        setDateFilter('');
    };

    // Загрузка данных при монтировании или смене типа
    useEffect(() => {
        const currentData = getCurrentData();
        //extractSubjects(currentData);
        setItems(currentData);
    }, [contentType, testsOriginal, surveysOriginal]);
    // Отдельный эффект для обновления subjects при изменении items
useEffect(() => {
    if (items.length > 0) {
        const subjectsSet = new Set();
        items.forEach(item => {
            if (item.subject) {
                subjectsSet.add(item.subject);
            }
        });
        const subjectsList = ['Все предметы', ...Array.from(subjectsSet)];
        setSubjects(subjectsList);
    } else {
        setSubjects(['Все предметы']);
    }
}, [items]); // Зависит только от items, не от currentData
    // Фильтрация при изменении фильтров
    useEffect(() => {
        if (items.length > 0) {
            filterItems();
        }
    }, [searchQuery, selectedSubject, dateFilter, items]);

    // Получение информации о типе элемента
    const getItemTypeInfo = (item) => {
        if (contentType === 'tests') {
            return {
                typeLabel: 'Тест',
                duration: item.duration,
                passingScore: item.passingScore,
                maxAttempts: item.maxAttempts,
                showStats: true
            };
        } else {
            return {
                typeLabel: 'Анкета',
                duration: null,
                passingScore: null,
                maxAttempts: null,
                showStats: false
            };
        }
    };

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
                {/* Переключатель типов */}
                <Box className={classes.header}>
                    <Tabs 
                        value={contentType} 
                        onChange={handleContentTypeChange}
                        indicatorColor="primary"
                        textColor="primary"
                        style={{ marginBottom: 24 }}
                    >
                        <Tab value="tests" label="Мои тесты" />
                        <Tab value="surveys" label="Мои анкеты" />
                    </Tabs>
                    
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateItem}
                            size="small"
                        >
                            Нов{contentType === 'tests' ? 'ый тест' : 'ая анкета'}
                        </Button>
                    </Box>
                </Box>

                <TestsFilter 
                    classes={classes} 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    showFilters={showFilters} 
                    setShowFilters={setShowFilters} 
                    clearFilters={clearFilters} 
                    selectedSubject={selectedSubject} 
                    dateFilter={dateFilter} 
                    setSelectedSubject={setSelectedSubject} 
                    subjects={subjects} 
                    setDateFilter={setDateFilter}
                />

                {/* Информация о результатах */}
                <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                        Найдено {contentType === 'tests' ? 'тестов' : 'анкет'}: <strong>{filteredItems.length}</strong> из {items.length}
                    </Typography>
                    {filteredItems.length < items.length && (
                        <Button 
                            size="small" 
                            onClick={clearFilters}
                            variant="text"
                        >
                            Показать все ({items.length})
                        </Button>
                    )}
                </Box>

                {/* Список элементов */}
                <Box>
                    {filteredItems.length === 0 ? (
                        <Paper style={{ padding: 40, textAlign: 'center' }}>
                            <SearchIcon style={{ fontSize: 48, color: '#9e9e9e', marginBottom: 16 }} />
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                {contentType === 'tests' ? 'Тесты' : 'Анкеты'} не найдены
                            </Typography>
                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                                Попробуйте изменить параметры поиска
                            </Typography>
                        </Paper>
                    ) : (
                        filteredItems.map((item) => {
                            const itemInfo = getItemTypeInfo(item);
                            return (
                                <Card
                                    key={item._id}
                                    className={classes.testCard}
                                    onClick={() => handleItemClick(item._id)}
                                >
                                    <CardContent>
                                        {/* Заголовок карточки */}
                                        <Box className={classes.testHeader}>
                                            <Box flex={1}>
                                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                    <Typography variant="h6" className={classes.testTitle} gutterBottom>
                                                        {item.name}
                                                    </Typography>
                                                    <Chip
                                                        label={itemInfo.typeLabel}
                                                        size="small"
                                                        style={{ 
                                                            backgroundColor: contentType === 'tests' ? '#e3f2fd' : '#f3e5f5', 
                                                            color: contentType === 'tests' ? '#1976d2' : '#9c27b0', 
                                                            fontWeight: '500' 
                                                        }}
                                                    />
                                                </Box>
                                                {item.description && (
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
                                                        {item.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                                                <Chip
                                                    label={item.subject}
                                                    size="small"
                                                    style={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: '500' }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Информация об элементе */}
                                        {itemInfo.showStats && (
                                            <Box className={classes.testInfo}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6} sm={4} md={2}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <AccessTimeIcon fontSize="small" color="action" />
                                                            <Typography variant="body2">
                                                                <strong>{itemInfo.duration}</strong> мин
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={6} sm={4} md={2}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <CheckCircleIcon fontSize="small" color="action" />
                                                            <Typography variant="body2">
                                                                <strong>{itemInfo.passingScore}%</strong>
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={6} sm={4} md={2}>
                                                        <Typography variant="body2">
                                                            <strong>Попыток:</strong> {itemInfo.maxAttempts || '∞'}
                                                        </Typography>
                                                    </Grid>
                                                    
                                                    <Grid item xs={6} sm={4} md={2}>
                                                        <Typography variant="body2">
                                                            <strong>Создан:</strong> {formatDateForDisplay(item.createdAt)}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}

                                        {/* Действия */}
                                        <Box className={classes.testActions}>
                                            <IconButton
                                                size="small"
                                                title="Копировать ссылку"
                                                onClick={(e) => handleShareItem(item._id, e)}
                                                style={{ color: '#2e7d32' }}
                                            >
                                                <ShareIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                title="Удалить"
                                                onClick={(e) => handleDeleteClick(item._id, e)}
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
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Подтверждение удаления</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Вы уверены, что хотите удалить {contentType === 'tests' ? 'этот тест' : 'эту анкету'}? 
                            Все связанные данные будут безвозвратно удалены.
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

                <SnackbarCustom setSnackbar={setSnackbar} snackbar={snackbar} />
            </Box>
        </>
    );
};

export default TestListPage;