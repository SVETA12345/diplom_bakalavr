import { List, ListItem, ListItemText } from '@material-ui/core';
import CreateQuestionForm from '../CreateQuestionForm/CreateQuestionForm';
import {
  IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

const QuestionsList = ({testId, questions, handleShowModalQuestion, handleDeleteQuestion, handleSaveUpdateQuestion}) => {
    return (
         <List>
          {questions.map((q, idx) => {
          return !q.showForm ? (
            <ListItem key={q.id} divider>
              <ListItemText
                primary={`Вопрос ${q.order}: ${q.text}`}
                secondary={`Тип: ${q.type === 'single' ? 'Одиночный выбор' : q.type === 'multiple' ? 'Множественный выбор' : 'Текстовый'} | Баллы: ${q.points}`}
              />
              <IconButton edge="end" aria-label="edit" onClick={() => handleShowModalQuestion(q._id, true)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(q._id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ) : (
             <CreateQuestionForm 
             key={q._id}
             questionOriginal={q}
            testId={testId}
            onSave={(question) => {
              handleSaveUpdateQuestion(question);
            }}
            onCancel={() => handleShowModalQuestion(q._id, false)}
          />
          )
            
})}
        </List>
    )
}

export default QuestionsList;