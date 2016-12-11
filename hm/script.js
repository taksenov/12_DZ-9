// ДЗ 1: Описание задания доступно по данной прямой ссылке:
// https://youtu.be/L4Jq9_H6bgE

// TODO
// - Друзья должны быть отсортированы по дате рождения в порядке убывания.
// То есть на самом верху списка расположен друг с ближайший датой рождения.
//
// - реализовать возврат обратно в ЛЕВЫЙ список из ПРАВОГО, сделать смену иконки
//  на крестик!
//
// - реализовать сохранение и загрузку данных о пользователях и где они лежат
// записывая все в локалСторадж
//
// - XXX нужна функция(и), которая восстанавливает по левому и правому массивам DOM
// дерево УЖЕ ЕСТЬ называется generateFriendsToDom
//
//
//
// - НЕТ ВСЕ НАХ!!!! ЧТО ЗА ЕРЕСЬ! ДЕРЖАТЬ В ЛОКАЛ СТОРАДЖЕ ТОЛЬКО ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
// ИЗ ГРАНД_МАССИВОВ массивы отобранных пользователей не учитывать при сохранении
// в локалСторадж
//
// Использование шаблонизатора приветствуется.
// =============================================================================

// =============================================================================
// VK AppID = 5757533
// =============================================================================

// =============================================================================
// Установка HTTP-сервера:
// 1) npm install http-server -g
// Запуск HTTP-сервера:
// 2) http-server hm -p 7777 -a 127.0.0.1
// 3) http://localhost:7777/
// =============================================================================

// Настроечные переменные ======================================================
let vkAppId = 5757533;
let headerUserFriendsVK = document.getElementById('headerUserFriendsVK');
let listOfDownloadedFriends = document.getElementById('listOfDownloadedFriends');
let listOfMovedFriends = document.getElementById('listOfMovedFriends');
let allRenderedFriends = document.getElementById('allRenderedFriends');
let VK_ACCESS_FRIENDS = 2;
let VK_API_VERSION = '5.8';
let grandArrOfFriendsObj = [];          // главный массив Друзей из ВК
let tempArrOfFriendsObjLeft = [];                // массив всех Друзей -- слева
let tempSearchArrOfFriendsObjLeft = [];          // массив всех НАЙДЕННЫХ Друзей -- слева
let tempArrOfFriendsObjRight = [];               // массив выбранных друзей -- справа
let tempSearchArrOfFriendsObjRight = [];         // массив выбранных НАЙДЕННЫХ друзей -- справа
let searchInputLeft = document.getElementById('searchInputLeft');
let searchInputRight = document.getElementById('searchInputRight');
let btnSaveFriendsSet = document.getElementById('btnSaveFriendsSet');       // кнопка сохранить друзей в локал сторадж
// let dragSrcEl = null;
let draggedElement;
// Настроечные переменные ======================================================

// вспомогательные функции======================================================
// функция сравнения возраста
function compareAge(personA, personB) {
    let friendA = new Date(personA.bdate.replace(/(\d+)\.(\d+)\.(\d+)/, '$2/$1/$3'));
    let friendB = new Date(personB.bdate.replace(/(\d+)\.(\d+)\.(\d+)/, '$2/$1/$3'));
    friendA = Date.parse(friendA);
    friendB = Date.parse(friendB);
    return friendB - friendA;       // здесь можно поменять порядок сортировки, поменяв слагаемые
} // compareAge

/**
 * generateFriendsToDom генерация друзей из массива в DOM
 * @param  {DOM element} sourceDOMElement - родительский DOM элемиент в который будет вставляться сгенеренный Handlebars темплейт
 * @param  {DOM element} handlebarsDOMTemplate - Handlebars темплейт который будет вставляться в DOM на странице
 * @param  {array} dataArray - массив с объектами (вставляются друзья из VK, поля связаны с Handlebars темплейтом)
 * @return {boolean} or {Throw New Error} выбрасываем ошибку, если входные параметры пустые, если все ок то возвращаем true
 */
function generateFriendsToDom( sourceDOMElement, handlebarsDOMTemplate, dataArray ) {
    if ( arguments.length === 0 || !dataArray ) {
        throw new Error('DATA_EMPTY');
    }
    let source = handlebarsDOMTemplate.innerHTML;
    let templateFn = Handlebars.compile(source);
    let template = templateFn({ friendslist: dataArray });
    sourceDOMElement.innerHTML = template;
    return true;
} //generateFriendsToDom

// находит друзей в массиве и затем оставляет их в массиве на выходе
function searchFriend(textInput, sourceArray){
    let result = [];
    for(let friend of sourceArray){
        if (
            ~friend.first_name.toLowerCase().indexOf(textInput.toLowerCase())
            ||
            ~friend.last_name.toLowerCase().indexOf(textInput.toLowerCase())
        ) {
            result.push(friend);
        }
    }
    return result;
} //searchFriend

/**
* Ищет нужный класс для выбранного таргета
* @param  { DOMTokenList collection of the class attributes} classList коллекция всех классов элемента
* @param  {string} findedClass искомый класс
* @return {boolean}             если класс найден то true иначе false
*/
function findNeedClassName(classList, findedClass) {
    if ( classList.length !== 0 ) {
        for (let i=0; i < classList.length; i++ ) {
            if (classList[i] === findedClass ) {
                return true;
            }
        }
    }
    return false;
} //findNeedClassName
// вспомогательные функции======================================================

// Обработчики событий =========================================================
/**
 * функция живого поиска друзей на странице
 * @param  {[type]} e                     [description]
 * @param  {[type]} searchString          строка поиска
 * @param  {[type]} sourceDOMElement      дом элемент в котором происходит поиск и отображение результатов
 * @param  {[type]} handlebarsDOMTemplate handlebars шаблон который строится внутри sourceDOMElement
 * @param  {[type]} arraySearch           массив найденных друзей
 * @param  {[type]} arrayGrand            первоначальный массив по которому ведется поиск
 * @return {[type]}                       возвращается массив найденных друзей
 */
function liveFriendsSearch( e, searchString, sourceDOMElement, handlebarsDOMTemplate, arraySearch, arrayGrand ) {
    if ( searchString === '' || !searchString ) {
        arraySearch = [].concat(arrayGrand);
        arraySearch.sort(compareAge);
        generateFriendsToDom( sourceDOMElement, handlebarsDOMTemplate, arraySearch );
        return arraySearch;
    }
    arraySearch = searchFriend(searchString, arrayGrand);
    arraySearch.sort(compareAge);
    generateFriendsToDom( sourceDOMElement, handlebarsDOMTemplate, arraySearch );
    return arraySearch;
} // liveFriendsSearch

// начало перетаскивания карточки друга
function handleDragStart(e) {
    let element = e.target;
    let needClassName = false;
    needClassName = findNeedClassName(element.classList, 'friend_block__design');
    if ( needClassName && element.tagName === 'DIV' ) {
        draggedElement = element;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', draggedElement.innerHTML);
    }
    return true;
} // handleDragStart

// перетаскиваемый элемент достигает конечного элемента
function handleDragEnter(e) {
    e.preventDefault();
    return true;
} // handleDragEnter

// разрешение на сброс элемента только в отпредеоенный DOM элемент на странице'
function handleDragOver(e) {
    let element = e.target;
    let needClassName = false;
    needClassName = findNeedClassName(element.classList, 'friends__block_drop');
    if ( needClassName && element.tagName === 'DIV' ) {
        e.preventDefault();
    }
} // handleDragOver

// бросание элемента в конкретный DOM элемент
function handleDrop(e) {
    let element = e.target;
    let needClassName = false;
    e.preventDefault();
    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }
    needClassName = findNeedClassName(element.classList, 'friends__block_drop');
    if ( needClassName && element.tagName === 'DIV' ) {
        draggedElement.parentNode.removeChild( draggedElement );
        element.appendChild( draggedElement );

        let arrayOfLinks = draggedElement.getElementsByTagName('a');
        let movedFriendId = '';

        for (let i=0; i<arrayOfLinks.length; i++) {
            if ( arrayOfLinks[i].className === 'friend__id_link' ) {
                movedFriendId = arrayOfLinks[i].innerText.trim();
            }
        }

        // IDEA в handlebars шаблоне в дата атрибут загонять VK user_id а потом по нему искать, например вдруг из отображения id нужно скрыть
        for (let i=0; i<tempArrOfFriendsObjLeft.length; i++) {
            if (tempArrOfFriendsObjLeft[i].id === +movedFriendId) {
                // console.log('tempArrOfFriendsObjLeft[i].id',tempArrOfFriendsObjLeft[i].id);
                let arrayMovedFriendCard = tempArrOfFriendsObjLeft.splice(i, 1);
                tempArrOfFriendsObjRight = tempArrOfFriendsObjRight.concat(arrayMovedFriendCard);
            }
        }

        // console.log('LEFT',tempArrOfFriendsObjLeft);
        // console.log('RIGHT',tempArrOfFriendsObjRight);
    }
    return false;
} // handleDrop

// сохранение данных о друзьях в localStorage
function handleSaveFriendsToStorage(e) {
    // TODO сюда зафигачить сохрание в локал сторадж! см
    console.log('tempSearchArrOfFriendsObjRight', tempSearchArrOfFriendsObjRight);
} // handleSaveFriendsToStorage
// Обработчики событий =========================================================

// запрос друзей из VK =========================================================
new Promise(function(resolve) {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.onload = resolve;
        }
    })
    // запрос авторизации в ВК
    .then(function() {
        return new Promise(function(resolve, reject) {
            VK.init({
                apiId: vkAppId
            });

            VK.Auth.login(function(response) {
                if (response.session) {
                    resolve(response);
                } else {
                    reject(new Error('Не удалось авторизоваться'));
                }
            }, VK_ACCESS_FRIENDS);
        });
    })
    // получение полного имени пользователя
    .then(function() {
        return new Promise(function(resolve, reject) {
            VK.api('users.get', {'name_case': 'gen'}, function(response) {
                if (response.error) {
                    reject(new Error(response.error.error_msg));
                } else {
                    headerUserFriendsVK.textContent = `Друзья ${response.response[0].first_name} ${response.response[0].last_name}`;
                    resolve();
                }
            });
        })
    })
    // получение id всех друзей пользователя
    .then(function() {
        return new Promise(function(resolve, reject) {
            VK.api('friends.get', {v: '5.8'}, function(serverAnswer) {
                if (serverAnswer.error) {
                    reject(new Error(serverAnswer.error.error_msg));
                } else {
                    resolve(serverAnswer);
                }
            });
        });
    })
    // получение данных всех ранее полученных друзей, обработка дат рождения, вывод в DOM
    .then( function(serverAnswer) {
        return new Promise(
            function(resolve, reject) {
                VK.api(
                    'users.get',
                    {
                        v: VK_API_VERSION,
                        user_ids: serverAnswer.response.items,
                        fields: 'bdate,photo_50,friend_status'
                    },
                    function(serverAnswer) {
                        if (serverAnswer.error) {
                            reject(new Error(serverAnswer.error.error_msg));
                        } else {
                            for (let i = 0; i < serverAnswer.response.length; i++) {
                                if ( serverAnswer.response[i].bdate && typeof serverAnswer.response[i].bdate !== 'undefined' ) {
                                    if (serverAnswer.response[i].bdate.match(/\.\d{4}/i)) {
                                        let tempLength = grandArrOfFriendsObj.length;
                                        grandArrOfFriendsObj[tempLength] = serverAnswer.response[i];
                                        // tempArrOfFriendsObjLeft[tempLength] = serverAnswer.response[i];
                                    }
                                }
                            }
                            tempArrOfFriendsObjLeft = [].concat(grandArrOfFriendsObj);
                            // вызов функции сортировки по возрасту
                            grandArrOfFriendsObj.sort(compareAge);
                            // вывод данных о друзьях в DOM
                            generateFriendsToDom( listOfDownloadedFriends, allRenderedFriends, grandArrOfFriendsObj );
                            // высота правого блока такая же как и у левого
                            listOfMovedFriends.style.height=listOfDownloadedFriends.offsetHeight+"px"
                            resolve();
                        }
                });
            }
        );
    })
    .catch(function(e) {
        alert(`Ошибка: ${e.message}`);
    });
// запрос друзей из VK =========================================================




// события на DOM элементах ====================================================
// событие ввода текста для input Search Left
searchInputLeft.addEventListener(
    'input',
    (e) => {
        tempSearchArrOfFriendsObjLeft = liveFriendsSearch(e, searchInputLeft.value, listOfDownloadedFriends, allRenderedFriends, tempSearchArrOfFriendsObjLeft, tempArrOfFriendsObjLeft );
    }
);
// событие ввода текста для input Search Right
searchInputRight.addEventListener(
    'input',
    (e) => {
        tempSearchArrOfFriendsObjRight = liveFriendsSearch(e, searchInputRight.value, listOfMovedFriends, allRenderedFriends, tempSearchArrOfFriendsObjRight, tempArrOfFriendsObjRight );
    }
);
// события для отработки Drag and Drop
listOfDownloadedFriends.addEventListener('dragstart', handleDragStart);
document.addEventListener('drop', handleDrop);
listOfDownloadedFriends.addEventListener('dragenter', handleDragEnter);
document.addEventListener('dragover', handleDragOver);
// ====

btnSaveFriendsSet.addEventListener(
    'click',
    (e) => {
        handleSaveFriendsToStorage(e);
    }
);
// события на DOM элементах ====================================================


//
