import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";
import { Container, Button, Typography, Box } from "@material-ui/core";
import CreateQuestionForm from "../../components/CreateQuestionForm/CreateQuestionForm";
import AddIcon from "@material-ui/icons/Add";
import { TextField, Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { testsApi } from "../../utils/testsApi";
import { questionsApi } from "../../utils/questionsApi";
import ModalStatus from "../../components/ModalStatus/ModalStatus";
import Header from "../../components/Header/Header";
import QuestionsList from "../../components/QuestionsList/QuestionsList";
import { useDispatch } from "react-redux";
import ImageIcon from "@material-ui/icons/Image";
import DialogQr from "../../components/DialogQr/DialogQr";
import SnackbarCustom from "../../components/SnackbarCustom/SnackbarCustom";

function TestEditor() {
  const dispatch = useDispatch();
  // Состояния для параметров теста
  const [testName, setTestName] = useState("");
  const { testIdActive } = useParams();
  const [testDescription, setTestDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [passingScore, setPassingScore] = useState(60);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogLink, setOpenDialogLink] = useState(false);
  const [messageDialog, setMessageDialog] = useState("");
  const [titleDialog, setTitleDialog] = useState("");
  const [testId, setTestId] = useState(null);
  // Состояния для вопросов
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const subjectsList = [
    "Информатика",
    "Математика",
    "Русский",
    "Геология",
    "Физика",
  ];
  const [isSaveButton, setIsSaveButton] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [testUrl, setTestUrl] = useState("");
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'info',
    });

  // Функция для генерации QR-кода
  const handleGenerateQR = async () => {
    const origin = window.location.origin;
    setTestUrl(`${origin}/test_take/${testId}`);
    setQrCode(true);
    setOpenDialogLink(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveTest = (e) => {
    const test = {
      name: testName,
      description: testDescription,
      subject: subject,
      duration: duration,
      maxAttempts: maxAttempts,
      showCorrectAnswers: showCorrectAnswers,
      passingScore: passingScore,
      createdAt: Date.now(),
    };
    testsApi
      .addTest(test)
      .then((data) => {
        setTestId(data._id);
        setOpenDialog(true);
        setMessageDialog("Сохранение прошло успешно!");
        setTitleDialog("Сохранение");
        setIsSaveButton(false);
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };

  const handleUpdateTest = (e) => {
    const test = {
      name: testName,
      description: testDescription,
      subject: subject,
      duration: duration,
      maxAttempts: maxAttempts,
      showCorrectAnswers: showCorrectAnswers,
      passingScore: passingScore,
      _id: testId,
    };
    testsApi
      .updateTest(test)
      .then((data) => {
        setOpenDialog(true);
        setMessageDialog("Сохранение прошло успешно!");
        setTitleDialog("Сохранение");
        setIsSaveButton(false);
        dispatch({
          type: "UPDATE_TESTS",
          payload: data,
        });
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };
  // Функция сохранения вопроса
  const handleSaveQuestion = (question) => {
    questionsApi
      .addQuestion(question)
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

  const handleSaveUpdateQuestion = (qNew) => {
    delete qNew.showForm;
    questionsApi
      .updateQuestion(qNew)
      .then((q) => {
        const questionsNew = questions.map((q) => {
          if (q._id == qNew._id)
            return {
              ...qNew,
              showForm: false,
            };
          return {
            ...q,
          };
        });
        setQuestions(questionsNew);
      })
      .catch((err) => {
        setOpenDialog(true);
        setMessageDialog(err.message);
        setTitleDialog("Ошибка");
      });
  };
  // Функции открфтия формы для  редактирования и удаления вопросов
  const handleShowModalQuestion = (id, valueShowForm) => {
    // Реализация редактирования вопроса
    const questionsNew = questions.map((q) => {
      if (q._id == id)
        return {
          ...q,
          showForm: valueShowForm,
        };
      return {
        ...q,
      };
    });
    setQuestions(questionsNew);
  };

  const handleDeleteQuestion = (id) => {
    questionsApi
      .deleteQuestion(id)
      .then((q) => {
        // Обновляем порядок вопросов
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
  useEffect(() => {
    if (testIdActive) {
      testsApi
        .getTestById(testIdActive)
        .then((t) => {
          setTestName(t.name);
          setTestDescription(t.description);
          setSubject(t.subject);
          setDuration(t.duration);
          setMaxAttempts(t.maxAttempts);
          setShowCorrectAnswers(t.showCorrectAnswers);
          setPassingScore(t.passingScore);
          setTestId(t._id);
          setIsSaveButton(false);
        })
        .then(() => {
          questionsApi
            .getQuestions(testIdActive)
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
  }, [testIdActive]);
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
            testUrl={testUrl}
            setSnackbar={setSnackbar}
          />

          {/* Уведомление о копировании */}
          <SnackbarCustom
            snackbar={snackbar}
            setSnackbar={setSnackbar}
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            {testId && (
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
            Редактор тестов
          </Typography>

          {/* Форма параметров теста */}
          <Box mb={4} p={3} border="1px solid #e0e0e0" borderRadius={4}>
            <Typography variant="h6" gutterBottom>
              Основные параметры теста
            </Typography>
            <Box>
              {isSaveButton ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveTest}
                  disabled={!testName || !subject}
                >
                  Сохранить тест
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateTest}
                  disabled={!testName || !subject}
                >
                  Редактировать
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название теста"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                  inputProps={{ minLength: 2, maxLength: 30 }}
                  helperText="От 2 до 30 символов"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание теста"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  required
                  size="small"
                  freeSolo
                  value={subject || ""}
                  options={subjectsList}
                  onBlur={(event, newValue) => {
                    setSubject(event.target.value || "");
                  }}
                  onChange={(event, newValue) => {
                    setSubject(newValue || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Дисциплина*"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Время на прохождение (минут)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                  helperText="0 = без ограничения"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Максимальное количество попыток"
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Проходной балл (%)"
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  required
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showCorrectAnswers}
                      onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                    />
                  }
                  label="Показывать правильные ответы после прохождения"
                />
              </Grid>
            </Grid>
          </Box>
          {/* Кнопка добавления вопроса - всегда видна при наличии заполненных параметров теста */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            style={{ marginBottom: "20px" }}
            disabled={!testName || !subject || isSaveButton}
          >
            Добавить вопрос
          </Button>

          {/* Секция добавления вопросов */}
          <Box mb={0}>
            <Typography variant="h5" gutterBottom>
              Вопросы теста
            </Typography>

            {showForm && (
              <Box mb={3} p={3} border="1px solid #e0e0e0" borderRadius={4}>
                <CreateQuestionForm
                  orderNew={questions.length + 1}
                  testId={testId}
                  onSave={(question) => {
                    handleSaveQuestion(question);
                    setShowForm(false); // Закрываем форму после сохранения
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
                testId={testId}
                questions={questions}
                handleShowModalQuestion={handleShowModalQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
                handleSaveUpdateQuestion={handleSaveUpdateQuestion}
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

export default TestEditor;
