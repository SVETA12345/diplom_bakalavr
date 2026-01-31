import './OverviewFeatures.css';
import setting from '../../images/setting.png'
import link from '../../images/link.png'

function OverviewFeatures({bottomRef}) {
  return (
      <main className='over'>
        <div ref={bottomRef} className='over__container'>
            <img src={setting} alt='Настройки' className='over__img'></img>
            <div>
                <h3 className='over__title'>Гибкая настройка теста</h3>
                <div className='over__line'></div>
                <p className='over__text'>В конструкторе тестов доступен обширный набор гибких настроек, что позволяет легко адаптировать тест под ваши конкретные потребности и требования.</p>
            </div>
        </div>
        <div className='over__container'>
            <img src={link} alt='Ссылка' className='over__img'></img>
            <div>
                <h3 className='over__title'>Основная ссылка</h3>
                <div className='over__line'></div>
                <p className='over__text'>Ваш тест доступен по ссылке. Благодаря сложному уникальному адресу, перейти по ней смогут исключительно те люди, которым вы её отправите.</p>
            </div>
        </div>
      </main>
  );
}

export default OverviewFeatures;