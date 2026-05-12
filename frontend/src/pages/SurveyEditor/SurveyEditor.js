import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Button, Typography, Box } from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";
import { TextField, Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { surveysApi } from "../../utils/surveysApi";

import ModalStatus from "../../components/ModalStatus/ModalStatus";
import Header from "../../components/Header/Header";
import { useDispatch } from "react-redux";
import ImageIcon from "@material-ui/icons/Image";
import DialogQr from "../../components/DialogQr/DialogQr";
import SnackbarCustom from "../../components/SnackbarCustom/SnackbarCustom";
import CreateSurveyQuestionForm from '../../components/CreateSurveyQuestionForm/CreateSurveyQuestionForm'
import QuestionsList from "../../components/QuestionsList/QuestionsList";
import { surveyQuestionsApi } from "../../utils/surveyQuestionsApi";

function SurveyEditor() {
  const dispatch = useDispatch();
  const { surveyIdActive } = useParams();
  
  // Состояния для параметров анкеты
  const [surveyName, setSurveyName] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [surveyType, setSurveyType] = useState("general");
  const [targetCourse, setTargetCourse] = useState("");
  const [targetSubject, setTargetSubject] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showResultsAfterSubmit, setShowResultsAfterSubmit] = useState(false);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogLink, setOpenDialogLink] = useState(false);
  const [messageDialog, setMessageDialog] = useState("");
  const [titleDialog, setTitleDialog] = useState("");
  const [surveyId, setSurveyId] = useState(null);
  
  // Состояния для вопросов
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSaveButton, setIsSaveButton] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [surveyUrl, setSurveyUrl] = useState("");
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Типы анкет
  const surveyTypesList = [
    { value: "general", label: "Общая анкета" },
    { value: "course_evaluation", label: "Оценка курса" },
    { value: "feedback", label: "Обратная связь" },
    { value: "student_satisfaction", label: "Удовлетворенность студентов" },
  ];

  const coursesList = [
    "Курс 1: Основы программирования",
    "Курс 2: Веб-разработка",
    "Курс 3: Базы данных",
    "Курс 4: Мобильная разработка",
  ];

  const subjectsList = [
    "Информатика",
    "Математика",
    "Русский",
    "Геология",
    "Физика",
  ];

  // Функция для генерации QR-кода
  const handleGenerateQR = async () => {
    const origin = window.location.origin;
    setSurveyUrl(`${origin}/survey_take/${surveyId}`);
    setQrCode(true);
    setOpenDialogLink(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Форматирование даты для отправки на сервер
  const formatDateForServer = (dateString) => {
    return new Date(dateString).toISOString();
  };

  // Сохранение анкеты
  const handleSaveSurvey = (e) => {
    const survey = {
      name: surveyName,
      description: surveyDescription,
      surveyType: surveyType,
      targetCourse: targetCourse,
      targetSubject: targetSubject,
      isActive: isActive,
      isAnonymous: isAnonymous,
      startDate: formatDateForServer(startDate),
      endDate: formatDateForServer(endDate),
      maxAttempts: maxAttempts,
      showResultsAfterSubmit: showResultsAfterSubmit,
    };
    
    surveysApi
      .addSurvey(survey)
      .then((data) => {
        setSurveyId(data._id);
        setOpenDialog(true);
        setMessageDialog("Анкета успешно сохранена!");
        setTitleDialog("Сохранение");
        setIsSaveButton(false);
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };

  // Обновление анкеты
  const handleUpdateSurvey = (e) => {
    const survey = {
      name: surveyName,
      description: surveyDescription,
      surveyType: surveyType,
      targetCourse: targetCourse,
      targetSubject: targetSubject,
      isActive: isActive,
      isAnonymous: isAnonymous,
      startDate: formatDateForServer(startDate),
      endDate: formatDateForServer(endDate),
      maxAttempts: maxAttempts,
      showResultsAfterSubmit: showResultsAfterSubmit,
      _id: surveyId,
    };
    
    surveysApi
      .updateSurvey(survey)
      .then((data) => {
        setOpenDialog(true);
        setMessageDialog("Анкета успешно обновлена!");
        setTitleDialog("Обновление");
        setIsSaveButton(false);
        dispatch({
          type: "UPDATE_SURVEYS",
          payload: data,
        });
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };

  
  const handleSaveQuestion = (question) => {
    surveyQuestionsApi
      .addSurveyQuestion(question)
      .then((q) => {
        const newQuestion = {
          ...q,
          showForm: false,
        };
        setQuestions([...questions, newQuestion]);
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };

  // Обновление вопроса
  const handleSaveUpdateQuestion = (qNew) => {
    delete qNew.showForm;
    surveyQuestionsApi
      .updateSurveyQuestion(qNew)
      .then((q) => {
        const questionsNew = questions.map((q) => {
          if (q._id === qNew._id) {
            return {
              ...qNew,
              showForm: false,
            };
          }
          return { ...q };
        });
        setQuestions(questionsNew);
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };

  // Открытие формы для редактирования
  const handleShowModalQuestion = (id, valueShowForm) => {
    const questionsNew = questions.map((q) => {
      if (q._id === id) {
        return { ...q, showForm: valueShowForm };
      }
      return { ...q };
    });
    setQuestions(questionsNew);
  };

  // Удаление вопроса
  const handleDeleteQuestion = (id) => {
    surveyQuestionsApi
      .deleteSurveyQuestion(id)
      .then(() => {
        const updatedQuestions = questions
          .filter((q) => q._id !== id)
          .map((q, index) => ({ ...q, order: index + 1 }));
        setQuestions(updatedQuestions);
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };

  // Загрузка данных при редактировании
  useEffect(() => {
    if (surveyIdActive) {
      surveysApi
        .getSurveyById(surveyIdActive)
        .then((data) => {
          const survey = data.survey || data;
          setSurveyName(survey.name);
          setSurveyDescription(survey.description || "");
          setSurveyType(survey.surveyType || "general");
          setTargetCourse(survey.targetCourse || "");
          setTargetSubject(survey.targetSubject || "");
          setIsActive(survey.isActive !== undefined ? survey.isActive : true);
          setIsAnonymous(survey.isAnonymous || false);
          
          // Форматируем даты для input
          if (survey.startDate) {
            const start = new Date(survey.startDate);
            setStartDate(start.toISOString().slice(0, 16));
          }
          if (survey.endDate) {
            const end = new Date(survey.endDate);
            setEndDate(end.toISOString().slice(0, 16));
          }
          
          setMaxAttempts(survey.maxAttempts || 1);
          setShowResultsAfterSubmit(survey.showResultsAfterSubmit || false);
          setSurveyId(survey._id);
          setIsSaveButton(false);
        })
        .then(() => {
                  surveyQuestionsApi
                    .getSurveyQuestions(surveyIdActive)
                    .then((qList) => {
                      const qNew = qList.map((q) => {
                        return {
                          ...q,
                          showForm: false,
                        };
                      });
                      setQuestions(qNew);
                    })
                    .catch((err) => {
                      setOpenDialog(true);
                      setMessageDialog(err.message);
                      setTitleDialog("Ошибка");
                    });
                })
        .catch((err) => {
          setOpenDialog(true);
          setMessageDialog(err.message);
          setTitleDialog("Ошибка");
        });
    }
  }, [surveyIdActive]);

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
      
      <Container maxWidth="md">
        <Box py={4}>
          {/* Диалог с QR-кодом и ссылкой */}
          <DialogQr
            qrCode={qrCode}
            openDialogLink={openDialogLink}
            setOpenDialogLink={setOpenDialogLink}
            testUrl={surveyUrl}
            setSnackbar={setSnackbar}
          />

          {/* Уведомление о копировании */}
          <SnackbarCustom
            snackbar={snackbar}
            setSnackbar={setSnackbar}
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            {surveyId && (
              <Button
                variant="contained"
                startIcon={<ImageIcon />}
                onClick={handleGenerateQR}
                color="primary"
              >
                Сгенерировать QR-код
              </Button>
            )}
          </Box>

          <Typography variant="h4" gutterBottom>
            Редактор анкет
          </Typography>

          {/* Форма параметров анкеты */}
          <Box mb={4} p={3} border="1px solid #e0e0e0" borderRadius={4}>
            <Typography variant="h6" gutterBottom>
              Основные параметры анкеты
            </Typography>
            
            <Box mb={2}>
              {isSaveButton ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSurvey}
                  disabled={!surveyName}
                >
                  Сохранить анкету
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateSurvey}
                  disabled={!surveyName}
                >
                  Редактировать
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название анкеты"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  required
                  inputProps={{ minLength: 2, maxLength: 200 }}
                  helperText="От 2 до 200 символов"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание анкеты"
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  multiline
                  minRows={3}
                  placeholder="Опишите цель анкетирования, инструкции для студентов..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  size="small"
                  value={surveyTypesList.find(t => t.value === surveyType) || null}
                  options={surveyTypesList}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => {
                    setSurveyType(newValue?.value || "general");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Тип анкеты"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  size="small"
                  freeSolo
                  value={targetCourse || ""}
                  options={coursesList}
                  onBlur={(event) => {
                    setTargetCourse(event.target.value || "");
                  }}
                  onChange={(event, newValue) => {
                    setTargetCourse(newValue || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Целевой курс"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  size="small"
                  freeSolo
                  value={targetSubject || ""}
                  options={subjectsList}
                  onBlur={(event) => {
                    setTargetSubject(event.target.value || "");
                  }}
                  onChange={(event, newValue) => {
                    setTargetSubject(newValue || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Дисциплина"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Максимальное количество попыток"
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  helperText="Обычно 1 для анкет"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Дата начала"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Дата окончания"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  }
                  label="Анкета активна"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                  }
                  label="Анонимное анкетирование"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showResultsAfterSubmit}
                      onChange={(e) => setShowResultsAfterSubmit(e.target.checked)}
                    />
                  }
                  label="Показывать результаты после отправки"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Кнопка добавления вопроса */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            style={{ marginBottom: "20px" }}
            disabled={!surveyName || isSaveButton}
          >
            Добавить вопрос
          </Button>
                   {/* Секция добавления вопросов */}
          <Box mb={0}>
            <Typography variant="h5" gutterBottom>
              Вопросы анкеты
            </Typography>

            {showForm && (
              <Box mb={3} p={3} border="1px solid #e0e0e0" borderRadius={4}>
                <CreateSurveyQuestionForm
                  orderNew={questions.length + 1}
                  surveyId={surveyId}
                  onSave={(question) => {
                    handleSaveQuestion(question);
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </Box>
            )}
          </Box>
           {/* Список добавленных вопросов */}
          {questions.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Добавленные вопросы ({questions.length})
              </Typography>
              <QuestionsList
                surveyId={surveyId}
                questions={questions}
                handleShowModalQuestion={handleShowModalQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
                handleSaveUpdateQuestion={handleSaveUpdateQuestion}
                FormComponent={CreateSurveyQuestionForm}
              />
            </Box>
          )}
        </Box>
        
        <ModalStatus
          titleDialog={titleDialog}
          openDialog={openDialog}
          handleCloseDialog={handleCloseDialog}
          dialogMessage={messageDialog}
        />
      </Container>
    </div>
  );
}

export default SurveyEditor;