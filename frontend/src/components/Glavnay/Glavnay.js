import "./Glavnay.css";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { testsApi } from "../../utils/testsApi";
import OptionCard from "../OptionCard/OptionCard";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
} from "@material-ui/core";
import {
  AddCircleOutline,
  QuestionAnswer,
  Assessment,
} from "@material-ui/icons";
import { useDispatch } from "react-redux";

function Glavnay(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [testsData, setTestsData] = useState([]);
  useEffect(() => {
    testsApi.getTests().then((data) => {
      console.log(data);
      setTestsData(data);
      dispatch({
        type: "SAVE_TESTS",
        payload: data,
      });
    });
  }, []);
  const stats = [
    {
      title: "Всего тестов",
      value: testsData.length,
      subtitle: "активных тестов",
      icon: <QuestionAnswer className="stat-icon" />,
      color: "#1976d2",
    },
    {
      title: "Ответы",
      value: "73",
      subtitle: "полученных ответов",
      icon: <QuestionAnswer className="stat-icon" />,
      color: "#2e7d32",
    },
    {
      title: "Статистика",
      value: "1",
      subtitle: "посмотреть статистику",
      icon: <Assessment className="stat-icon" />,
      color: "#ed6c02",
    },
  ];

  const handleCreateTest = () => {
    console.log("Создать новый тест");
    navigate('/test_editor')
    // Здесь будет логика создания теста
  };

  const handleTestClick = (testId) => {
    console.log("Открыть тест:", testId);
    // Навигация к тесту
  };

  return (
    <div>
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
      <Box className="dashboard-container">
        {/* Заголовок */}
        <Box className="dashboard-header">
          <Typography variant="h4" className="dashboard-title">
            Обзор
          </Typography>
          <Typography variant="subtitle1" className="dashboard-subtitle">
            Управляйте тестами и шаблонами
          </Typography>
        </Box>

        {/* Статистика */}
        <Grid container spacing={3} className="stats-grid">
          {stats.map((stat, index) => (
            <OptionCard key={index} stat={stat} index={index} />
          ))}
        </Grid>

        {/* Основной контент */}
        <Grid container spacing={3} className="content-grid">
          {/* Левая колонка */}
          <Grid item xs={12} lg={8}>
            {/* Создать новый тест */}
            <Card className="create-test-card" onClick={handleCreateTest}>
              <CardContent className="create-test-content">
                <AddCircleOutline className="create-test-icon" />
                <Typography variant="h6" className="create-test-title">
                  Создать новый тест
                </Typography>
                <Typography variant="body2" className="create-test-subtitle">
                  Создайте опрос или анкету с нуля
                </Typography>
                <Button
                  variant="contained"
                  className="create-button"
                  startIcon={<AddCircleOutline />}
                >
                  Создать
                </Button>
              </CardContent>
            </Card>

            {/* Мои тесты */}
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default Glavnay;