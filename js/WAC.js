const scriptURL = 'https://script.google.com/macros/s/AKfycbz99VVyrs3-DBx99S_yIcvN7dzurnDAF0pEgwpeAJa_nprp7OBix9OWJciVAVlyVNmk/exec';

const updateModal = document.getElementById('updateModal');
const modalOverlay = document.getElementById('modalOverlay'); // モーダルオーバーレイを取得
const reloadOverlay = document.getElementById('reloadOverlay'); // リロードオーバーレイを取得
const headerOverlay = document.getElementById('headerOverlay'); // ヘッダーオーバーレイを取得
const footerOverlay = document.getElementById('footerOverlay'); // ヘッダーオーバーレイを取得

const rowsToDelete = []; // 削除対象のレコード数

window.onload = function() {
	fetchData();
};

function overlaySetBlock() {
	reloadOverlay.style.display = 'block';
	HFOverlaySetBlock();
}

function overlaySetNone() {
	reloadOverlay.style.display = 'none';
	HFOverlaySetNone();
}

function HFOverlaySetBlock() {
	headerOverlay.style.display = 'block';
	footerOverlay.style.display = 'block';
}

function HFOverlaySetNone() {
	headerOverlay.style.display = 'none';
	footerOverlay.style.display = 'none';
}

const updateIcon = document.getElementById('update-icon');
updateIcon.addEventListener('click', () => {
	localStorage.removeItem('spreadsheetData');
	fetchData();
	alert('キャッシュをクリアしてデータを取得します。');
});

// サイドメニュー開閉
const sideMenu = document.getElementById('side-menu');
const tuneIcon = document.getElementById('tune-icon');
const reSearchButton = document.getElementById('reSearchButton');
document.addEventListener('DOMContentLoaded', () => {

	// メニューを開く
	tuneIcon.addEventListener('click', () => {
		sideMenuOpen();
	});
	reSearchButton.addEventListener('click', () => {
		sideMenuOpen();
	});

	// メニューを閉じる
	const closeMenu = document.getElementById('close-menu');
	closeMenu.addEventListener('click', () => {
		sideMenuClose();
	});
});

// サイドメニューを開く
function sideMenuOpen() {
	sideMenu.classList.add('open');
	modalOverlay.style.display = 'block';
	HFOverlaySetBlock();
}

// サイドメニューを閉じる
function sideMenuClose() {
	sideMenu.classList.remove('open');
	modalOverlay.style.display = 'none';
	HFOverlaySetNone();
	updateFilterIcon(); // 絞り込み条件の有無
}

function fetchData() {
	const cachedData = localStorage.getItem('spreadsheetData');

	// オーバーレイを表示
	overlaySetBlock();

	if (cachedData) {
		// キャッシュが存在する場合はそれを使用
		currentData = JSON.parse(cachedData); // currentDataにキャッシュを格納
		displayData(currentData); // データを表示
		search();

		// オーバーレイを非表示
		overlaySetNone();
	} else {
		// キャッシュがない場合はスプレッドシートからデータを取得
		fetch(scriptURL)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				// キャッシュにデータを保存
				localStorage.setItem('spreadsheetData', JSON.stringify(data));
				currentData = data; // currentDataに取得したデータを格納
				displayData(data);
				search();
			})
			.catch(error => console.error('Error!', error.message))
			.finally(() => {
				// オーバーレイを非表示
				overlaySetNone();
			});
	}
}

let currentData = []; // 現在表示されているデータを保持する
let chacheDate = []; // キャッシュデータを保持する
let filteredRows = []; // 絞り込み結果の行番号を格納

// データをリストに表示する関数
function displayData(data) {
	currentData = data; // 現在表示されているデータを更新
	chacheDate = JSON.parse(localStorage.getItem('spreadsheetData')); // chacheDateにキャッシュを格納
	const display = document.getElementById('dataDisplay');
	display.innerHTML = ''; // 既存の内容をクリア

	data.forEach((row, rowIndex) => {
		const listItem = document.createElement('li'); // リストアイテムを作成
		// リストアイテムにデータ属性を追加
		listItem.dataset.rowIndex = rowIndex + 2; // 行番号をデータ属性に追加

		// 行番号を取得（1ベース）
		rowIndex = parseInt(listItem.dataset.rowIndex) - 2; // データ配列のインデックスに変換
		const rowData = currentData[rowIndex]; // フィルタリングされたデータから正しい行データを取得

		// 更新対象の値を取得
		const checkboxValue = rowData[0]; // 1列目の値
		const cookValue = rowData[1]; // 2列目の値
		const memoValue = rowData[2]; // 3列目の値
		const bookmarkValue = rowData[3]; // 4列目の値
		const insertTimeValue = rowData[4]; // 5列目の値
		const updateTimeValue = rowData[5]; // 6列目の値

		// キャッシュ内での行番号を検索
		const chacheRowIndex = chacheDate.findIndex(chacheRow => {
		// 比較するプロパティを指定
			return chacheRow[0] === checkboxValue && // 1列目で比較
				   chacheRow[1] === cookValue && // 2列目で比較
				   chacheRow[2] === memoValue && // 3列目で比較
				   chacheRow[3] === bookmarkValue && // 4列目で比較
				   chacheRow[4] === insertTimeValue && // 5列目で比較
				   chacheRow[5] === updateTimeValue; // 6列目で比較
		});

		// スプレッドシート上の行番号
		const sheetRowIndex = chacheRowIndex + 2; // chacheRowIndexに+2する

		// チェックボックスを作成
		const checkbox = document.createElement('input'); // チェックボックスを作成
		checkbox.type = 'checkbox';
		checkbox.checked = row[0] === true; // チェックボックスの状態を設定
		listItem.appendChild(checkbox); // チェックボックスをリストアイテムに追加

		// チェックボックスの変更イベント
		checkbox.addEventListener('change', (event) => {
			// チェックボックスの変更時にリストアイテムのクリックイベントをトリガーしない
			event.stopPropagation();
			// スプレッドシートを更新する関数（チェックボックス）
			updateCheckbox(sheetRowIndex, checkbox.checked); // 行番号は1ベースなので+2
		});

		// 2列目の要素をリストアイテムに追加
		const secondColumnText = (row[1] !== undefined && row[1] !== null) ? row[1] : ''; // 0も表示 // 2列目の値を取得（存在しない場合は空文字）
		const textNode = document.createElement('span'); // テキストをラップするためのspan要素
		textNode.classList.add('text-Node'); // クラスを追加してデザインを管理
		textNode.textContent = secondColumnText; // テキストを設定
		listItem.appendChild(textNode); // spanをリストアイテムに追加

		// チェックボックスの状態に応じて取り消し線を設定
		if (checkbox.checked) {
			textNode.style.textDecoration = 'line-through'; // チェックされている場合は取り消し線を追加
		}

		// ブックマーク中アイコンを作成
		const bookmarkOn = document.createElement('span');
		bookmarkOn.textContent = 'bookmark';
		bookmarkOn.classList.add('material-icons', 'bookmark-icon'); // クラスを追加
		bookmarkOn.id = 'bookmark-on'; // idを追加
		bookmarkOn.style.display = bookmarkValue ? 'inline' : 'none'; // ブックマーク状態に応じて表示
		listItem.appendChild(bookmarkOn); // ブックマークオンアイコンをリストアイテムに追加

		// ブックマーク未アイコンを作成
		const bookmarkOff = document.createElement('span');
		bookmarkOff.textContent = 'bookmark_border';
		bookmarkOff.classList.add('material-icons', 'bookmark-icon'); // クラスを追加
		bookmarkOff.id = 'bookmark-off'; // idを追加
		bookmarkOff.style.display = bookmarkValue ? 'none' : 'inline'; // ブックマーク状態に応じて表示
		listItem.appendChild(bookmarkOff); // ブックマークオフアイコンをリストアイテムに追加

		// ブックマークの変更イベント (TRUE→FALSE)
		bookmarkOn.addEventListener('click', (event) => {
			// ブックマークの変更時にリストアイテムのクリックイベントをトリガーしない
			event.stopPropagation();
			// スプレッドシートを更新する関数（ブックマーク）
			updateBookmark(sheetRowIndex, false); // 行番号は1ベースなので+2
			bookmarkOn.style.display = 'none'; // 表示を切り替え
			bookmarkOff.style.display = 'inline'; // 表示を切り替え
		});

		// ブックマークの変更イベント (TRUE→FALSE)
		bookmarkOff.addEventListener('click', (event) => {
			// ブックマークの変更時にリストアイテムのクリックイベントをトリガーしない
			event.stopPropagation();
			// スプレッドシートを更新する関数（ブックマーク）
			updateBookmark(sheetRowIndex, true); // 行番号は1ベースなので+2
			bookmarkOn.style.display = 'inline'; // 表示を切り替え
			bookmarkOff.style.display = 'none'; // 表示を切り替え
		});

		// 削除チェックボックスを作成
		const deleteCheckbox = document.createElement('input'); // 新しいチェックボックスを作成
		deleteCheckbox.type = 'checkbox'; // 新しいチェックボックス
		deleteCheckbox.classList.add('delete-checkbox'); // クラスを追加して後で管理
		deleteCheckbox.style.display = 'none'; // 初期状態で非表示
		listItem.appendChild(deleteCheckbox); // 2つめのチェックボックスをリストアイテムに追加

		// 削除チェックボックスの変更イベント（必要に応じて追加）
		deleteCheckbox.addEventListener('change', function() {
			deleteCheckbox.checked = !deleteCheckbox.checked;
			deleteSelect();
		});

		// 削除ボタンを作成
		const deleteButton = document.createElement('span');
		deleteButton.textContent = 'delete_outline';
		deleteButton.classList.add('material-icons'); // クラスを追加
		deleteButton.classList.add('single-delete-icons'); // クラスを追加
		listItem.appendChild(deleteButton); // リストアイテムに追加

		// リストアイテムにクリックイベントを追加
		listItem.addEventListener('click', (event) => {
			if (deleteMode) {
				deleteCheckbox.checked = !deleteCheckbox.checked;
				deleteSelect();
			}
			if (event.target !== checkbox && deleteMode == false) { // クリックがチェックボックスでない場合のみ遷移
				// モーダルにデータを渡す
				document.getElementById('updateModal1').value = (rowData[1] !== undefined && rowData[1] !== null) ? rowData[1] : ''; // データ1を設定
				document.getElementById('updateModal2').value = (rowData[2] !== undefined && rowData[2] !== null) ? rowData[2] : ''; // データ2を設定
				console.log(`Filtered Row Index: ${rowIndex}, Original Row Index: ${sheetRowIndex}`); // デバッグ用
				// 行番号をデータ属性に設定
				updateModal.dataset.rowIndex = rowIndex; // 検索結果内の行番号を設定
				updateModal.dataset.sheetRowIndex = sheetRowIndex; // キャッシュデータ内の行番号を設定

				// モーダルを表示
				updateModal.style.display = 'block'; // 編集モーダルを表示
				modalOverlay.style.display = 'block'; // オーバーレイを表示
				HFOverlaySetBlock();
			}
		});

		// 削除モードがTRUEのときの処理
		function deleteSelect() {
			const currentDataDelete = currentData.some(value => value === rowData);
			if (currentDataDelete) {
				// チェックボックスの状態に応じてリストアイテムのスタイルを変更
				if (deleteCheckbox.checked) {
					listItem.classList.add('selected'); // 選択状態のクラスを追加
					// 削除対象の行を追加する					
					if (!rowsToDelete.includes(sheetRowIndex)) {
						rowsToDelete.push(sheetRowIndex); // 行番号を追加
					}
				} else {
					listItem.classList.remove('selected'); // 選択状態のクラスを削除
					const index = rowsToDelete.indexOf(sheetRowIndex);
					if (index > -1) {
						rowsToDelete.splice(index, 1); // 行番号を削除
					}
				}
			}
			// ヘッダーの削除レコード数を更新
			updateSelectedCount();
		}

		// 削除全選択
		document.getElementById('done-icon').addEventListener('click', function() {
			deleteCheckbox.checked = true; // チェックボックスの状態を切り替え
			deleteSelect();
		});

		// 削除全解除
		document.getElementById('remove-done-icon').addEventListener('click', function() {
			deleteCheckbox.checked = false; // チェックボックスの状態を切り替え
			deleteSelect();
		});

		let handOver;
		deleteButton.addEventListener('click', (event) => {
			event.stopPropagation(); // リストアイテムのタッチイベントをトリガーしない
			deleteModalShow();
			doDeleteSingle.style.display = 'block';
			doDeleteAll.style.display = 'none';
			handOver = rowData;
		});

		// 削除対象の1行を送信
		doDeleteSingle.addEventListener('click', (event) => {
			event.stopPropagation(); // リストアイテムのタッチイベントをトリガーしない
			if (handOver) {
				handOver = null;
				deleteModalHidden();

				const cachedData = JSON.parse(localStorage.getItem('spreadsheetData'));
				cachedData.splice(sheetRowIndex - 2, 1); // 1は削除する要素の数
				localStorage.setItem('spreadsheetData', JSON.stringify(cachedData)); // キャッシュを更新

				search(); // 更新されたデータを表示
				
				// スプレッドシートへの削除リクエストを送信
				fetch(scriptURL, {
					method: 'POST',
					headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						action: 'singleDelete', // 削除アクション
						row: sheetRowIndex // 行番号を送信
					}),
				})
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					return response.json();
				})
				.then(data => {
					console.log('Delete successful:', data);
				})
				.catch(error => {
					console.error('Error deleting record:', error);
					// alert("エラーが発生しました。");
				});
			}
		});

		display.appendChild(listItem); // リストに追加
	});
}

// ヘッダーの削除レコード数をカウント
function updateSelectedCount() {
	const countElement = document.getElementById('selectedCount');
	countElement.textContent = rowsToDelete.length; // 選択された行の数を表示
}

// スプレッドシートを更新する関数（チェックボックス）
function updateCheckbox(row, isChecked) {
	const action = isChecked ? 'check' : 'uncheck'; // 更新アクションの決定
	const now = new Date();
	const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

	// キャッシュの更新
	const cachedData = JSON.parse(localStorage.getItem('spreadsheetData'));
	const rowIndex = row - 2; // 1ベースから0ベースに変換
	if (cachedData && cachedData[rowIndex]) {
		cachedData[rowIndex][0] = isChecked; // ブックマークの値を更新
		cachedData[rowIndex][5] = formattedDate; // 更新日時の値を更新
		localStorage.setItem('spreadsheetData', JSON.stringify(cachedData)); // キャッシュを更新
	}

	search(); // 更新されたデータを表示

	fetch(scriptURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			action: action,
			row: row,
			checkbox: isChecked, // チェックボックスの列のインデックスを追加
			updateTime: formattedDate,
		}),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	})
	.then(data => {
		console.log('Update successful:', data);
	})
	.catch(error => {
		console.error('Error updating spreadsheet:', error);
		// alert("エラーが発生しました。");
	})
}

// スプレッドシートを更新する関数（ブックマーク）
function updateBookmark(row, isBookmarked) {
	const action = isBookmarked ? 'bookmark' : 'unbookmark'; // 更新アクションの決定

	// キャッシュの更新
	const cachedData = JSON.parse(localStorage.getItem('spreadsheetData'));
	const rowIndex = row - 2; // 1ベースから0ベースに変換
	if (cachedData && cachedData[rowIndex]) {
		cachedData[rowIndex][3] = isBookmarked; // ブックマークの値を更新
		localStorage.setItem('spreadsheetData', JSON.stringify(cachedData)); // キャッシュを更新
	}

	search(); // 更新されたデータを表示

	fetch(scriptURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			action: action,
			row: row,
			bookmark: isBookmarked, // ブックマークの列のインデックスを追加
		}),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	})
	.then(data => {
		console.log('Update successful:', data);
	})
	.catch(error => {
		console.error('Error updating spreadsheet:', error);
		// alert("エラーが発生しました。");
	})
}

// モーダル関連
const insertModal = document.getElementById('insertModal');
const addIcon = document.getElementById('add-icon');

document.addEventListener('DOMContentLoaded', function() {
	const closeModal1 = document.getElementById('closeModal1');
	const closeModal2 = document.getElementById('closeModal2');

	// モーダルを表示
	addIcon.addEventListener('click', function() {
		insertModal.style.display = 'block'; // モーダルを表示
		modalOverlay.style.display = 'block'; // オーバーレイを表示
		HFOverlaySetBlock();
	});

	// モーダルを閉じる
	closeModal1.addEventListener('click', function() {
		insertModal.style.display = 'none'; // モーダルを非表示
		modalOverlay.style.display = 'none'; // オーバーレイを非表示
		HFOverlaySetNone();
		insertForm.reset(); // フォームの内容をクリア
	});

	// モーダルを閉じる
	closeModal2.addEventListener('click', function() {
		updateModal.style.display = 'none'; // モーダルを非表示
		modalOverlay.style.display = 'none'; // オーバーレイを非表示
		HFOverlaySetNone();
	});

	// モーダルの外側（オーバーレイ）をクリックしたときに閉じる
	modalOverlay.addEventListener('click', function() {
		insertModal.style.display = 'none'; // モーダルを非表示
		updateModal.style.display = 'none'; // モーダルを非表示
		insertForm.reset(); // フォームの内容をクリア
		sideMenuClose(); // ヘッダー、フッター、モーダルのオーバーレイ非表示を含む
		deleteModal.style.display = 'none';
	});
});

// 新規追加フォーム送信
const insertForm = document.forms['insert-form'];

insertForm.addEventListener('submit', function(event) {
	event.preventDefault(); // デフォルトの送信を防ぐ
	insertModal.style.display = 'none'; // モーダルを非表示
	modalOverlay.style.display = 'none'; // オーバーレイを非表示
	HFOverlaySetNone();

	const insertModal1 = document.getElementById('insertModal1').value;
	const insertModal2 = document.getElementById('insertModal2').value;

	const now = new Date();
	const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

	insertForm.reset(); // フォームの内容をクリア

	const newDate = [];
	newDate.push(false);
	newDate.push(insertModal1);
	newDate.push(insertModal2);
	newDate.push(false);
	newDate.push(formattedDate);
	newDate.push(formattedDate);

	// キャッシュの更新
	const cachedData = JSON.parse(localStorage.getItem('spreadsheetData'));
	cachedData.push(newDate);
	localStorage.setItem('spreadsheetData', JSON.stringify(cachedData)); // キャッシュを更新

	search(); // 更新されたデータを表示

	const insertFormData = new FormData(insertForm); // フォームデータを新たに作成

	// FormDataにパラメータを追加
	insertFormData.append('action', 'add'); // actionを'add'に設定
	insertFormData.append('data1', insertModal1); // モーダルの入力データを設定
	insertFormData.append('data2', insertModal2); // モーダルの入力データを設定
	insertFormData.append('time', formattedDate); // 追加、更新時間を設定

	fetch(scriptURL, { method: 'POST', body: insertFormData })
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json(); // レスポンスをJSON形式で取得
		})
		.then(data => {
			console.log('Insert successful:', data); // レスポンスの内容を確認
		})
		.catch(error => {
			console.error('Error!', error.message);
			// alert("エラーが発生しました。");
		})
});

// 更新フォーム送信
const updateForm = document.forms['update-form'];

updateForm.addEventListener('submit', function(event) {
	event.preventDefault(); // デフォルトの送信を防ぐ
	updateModal.style.display = 'none'; // モーダルを非表示
	modalOverlay.style.display = 'none'; // オーバーレイを非表示
	HFOverlaySetNone();

	const sheetRowIndex = parseInt(updateModal.dataset.sheetRowIndex) - 2; // キャッシュデータ内の行番号を取得
	const updateModal1 = document.getElementById('updateModal1').value;
	const updateModal2 = document.getElementById('updateModal2').value;

	// キャッシュの更新
	const cachedData = JSON.parse(localStorage.getItem('spreadsheetData'));
	cachedData[sheetRowIndex][1] = updateModal1; // 1列目を更新
	cachedData[sheetRowIndex][2] = updateModal2; // 2列目を更新
	localStorage.setItem('spreadsheetData', JSON.stringify(cachedData));

	search(); // 更新されたデータを表示

	const updateFormData = new FormData(updateForm); // フォームデータを新たに作成

	// 更新アクションと行番号を追加
	updateFormData.append('action', 'update'); // actionを'update'に設定
	updateFormData.append('row', sheetRowIndex + 2); // 更新する行番号を追加

	// モーダルの入力データを追加
	updateFormData.append('data1', updateModal1);
	updateFormData.append('data2', updateModal2);

	fetch(scriptURL, { method: 'POST', body: updateFormData })
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json(); // レスポンスをJSON形式で取得
		})
		.then(data => {
			console.log('Update successful:', data); // レスポンスの内容を確認
		})
		.catch(error => {
			console.error('Error!', error.message);
			// alert("エラーが発生しました。");
		})
});

let deleteMode = false; // 削除モードの状態を管理

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('delete-icon-false').addEventListener('click', () => {
		deleteModeChange(); // 削除モード=TRUE
	});
});

document.getElementById('delete-icon-true').addEventListener('click', () => {
	if (rowsToDelete.length === 0) {
		alert('削除するデータが選択されていません。');
	} else {
		deleteModalShow();
		doDeleteAll.style.display = 'block';
		doDeleteSingle.style.display = 'none';
	}
});

document.addEventListener('DOMContentLoaded', () => {
	doDeleteAll.addEventListener('click', () => {
		deleteModeChange(); // 削除モード=FALSE
		// 削除処理を実行
		deleteSelectedRecords();
		// ヘッダーの削除レコード数をリセット
		rowsToDelete.length = 0; // 配列を空にする
		updateSelectedCount(); // 選択数を更新
	});
});

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('cancelButton').addEventListener('click', () => {
		deleteModeChange(); // 削除モード=FALSE
		// ヘッダーの削除レコード数をリセット
		rowsToDelete.length = 0; // 配列を空にする
		updateSelectedCount(); // 選択数を更新
	});
});

// 削除するレコードを選択する関数
function deleteSelectedRecords() {
	deleteModalHidden();
	const cachedData = JSON.parse(localStorage.getItem('spreadsheetData'));
	for (let i = rowsToDelete.length - 1; i >= 0; i--) {
		cachedData.splice(rowsToDelete[i] - 2, 1); // 1は削除する要素の数
	}
	localStorage.setItem('spreadsheetData', JSON.stringify(cachedData)); // キャッシュを更新

	search(); // 更新されたデータを表示

	// 削除リクエストを送信
	fetch(scriptURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			action: 'delete',
			rows: JSON.stringify(rowsToDelete) // 削除する行の配列を送信
		}),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
	return response.json();
	})
	.then(data => {
		console.log('Delete successful:', data);
		rowsToDelete.length = 0; // 配列を初期化する
	})
	.catch(error => {
		console.error('Error deleting records:', error);
		// alert("エラーが発生しました。");
	});
}

// 削除確認モーダル機能
const deleteModal = document.getElementById('deleteModal');
const doDeleteSingle = document.getElementById('doDeleteSingle');
const doDeleteAll = document.getElementById('doDeleteAll');

function deleteModalShow() {
	deleteModal.style.display = 'block'; // モーダルを表示
	modalOverlay.style.display = 'block'; // オーバーレイを表示
	HFOverlaySetBlock();
}

function deleteModalHidden() {
	deleteModal.style.display = 'none'; // モーダルを非表示
	modalOverlay.style.display = 'none'; // オーバーレイを非表示
	HFOverlaySetNone();
}

document.getElementById('deleteCancel').addEventListener('click', () => {
	deleteModalHidden();
});

// ゴミ箱アイコン押下アクション
function deleteModeChange() {
	deleteMode = !deleteMode; // モードを切り替え
	headerColor(deleteMode); // ヘッダーの色を切り替え
	headerChar(deleteMode); // ヘッダーの文字を切り替え
	deleteCheckboxes(deleteMode); // チェックボックスの表示を切り替え
	deleteButton(deleteMode); // 単体削除ボタンの表示を切り替える関数
	deleteIcon(deleteMode); // ゴミ箱アイコンの表示を切り替え
	selectedCount(deleteMode); // ヘッダーの削除レコード数の表示を切り替え

	// add-icon,update-conの表示を切り替える
	addIcon.style.display = deleteMode ? 'none' : 'flex'; // 削除モード時は非表示、そうでない場合は表示
	updateIcon.style.display = deleteMode ? 'none' : 'inline'; // 削除モード時は非表示、そうでない場合は表示
	// action-buttonの表示を切り替える
	const actionButtonSearch = document.getElementById('action-button-search');
	const actionButtonDelete = document.getElementById('action-button-delete');
	actionButtonSearch.style.display = deleteMode ? 'none' : 'flow-root'; // 削除モードがTRUEの場合、非表示にする
	actionButtonDelete.style.display = deleteMode ? 'flow-root' : 'none'; // 削除モードがTRUEの場合、非表示にする

	// リストの全てのチェックボックスを非活性または活性にする
	const checkboxes = document.querySelectorAll('#dataDisplay input[type="checkbox"]');
	checkboxes.forEach(cb => {
		// deleteCheckboxクラスを持つチェックボックスは非活性にしない
		if (!cb.classList.contains('delete-checkbox')) {
			cb.disabled = deleteMode; // チェックボックスを非活性または活性に設定
		}
	});
	// ブックマークアイコンの非活性化
	const bookmarkOnIcons = document.querySelectorAll('#bookmark-on');
	const bookmarkOffIcons = document.querySelectorAll('#bookmark-off');
	bookmarkOnIcons.forEach(icon => {
		icon.style.pointerEvents = deleteMode ? 'none' : 'auto'; // クリックイベントを無効化
		icon.style.opacity = deleteMode ? '0.5' : '1'; // 見た目を変えるために透明度を変更
	});
	bookmarkOffIcons.forEach(icon => {
		icon.style.pointerEvents = deleteMode ? 'none' : 'auto'; // クリックイベントを無効化
		icon.style.opacity = deleteMode ? '0.5' : '1'; // 見た目を変えるために透明度を変更
	});

	// 削除モードが無効な場合、全てのリストアイテムからselectedクラスを外す
	if (!deleteMode) {
		const listItems = document.querySelectorAll('#dataDisplay li');
			listItems.forEach(item => {
			item.classList.remove('selected'); // selectedクラスを削除

			// deleteCheckboxをすべてFALSEに設定
			const deleteCheckbox = item.querySelector('.delete-checkbox');
			if (deleteCheckbox) {
				deleteCheckbox.checked = false; // チェックボックスをFALSEに設定
			}
		});
	}
}

// ヘッダーの色を切り替える関数
function headerColor(isVisible) {
	const header = document.getElementById('header');
	if (isVisible) {
		header.classList.add('header-delete-mode');
	} else {
		header.classList.remove('header-delete-mode');
	}
}

// ヘッダーの文字を切り替える関数
function headerChar(isVisible) {
	const cancelButton = document.querySelector('.left');
	const title = document.querySelector('.center');
	if (isVisible) {
		cancelButton.classList.remove('hidden'); // キャンセルボタンを非表示
		title.classList.remove('hidden'); // タイトルを非表示
	} else {
		cancelButton.classList.add('hidden'); // キャンセルボタンを非表示
		title.classList.add('hidden'); // タイトルを非表示
	}
}

// チェックボックスの表示を切り替える関数
function deleteCheckboxes(isVisible) {
	const checkboxes = document.querySelectorAll('.delete-checkbox'); // 削除用のチェックボックスを取得
	checkboxes.forEach(checkbox => {
		checkbox.style.display = isVisible ? 'inline' : 'none'; // 表示/非表示を切り替え
	});
}

// 単体削除ボタンの表示を切り替える関数
function deleteButton(isVisible) {
	const deleteButton = document.querySelectorAll('.single-delete-icons'); // 削除用のチェックボックスを取得
	deleteButton.forEach(deleteButton => {
		deleteButton.style.display = isVisible ? 'none' : 'inline'; // 表示/非表示を切り替え
	});
}

// ゴミ箱アイコンの表示を切り替える関数
function deleteIcon(isVisible) {
	const deleteIconTrue = document.getElementById('delete-icon-true'); // ゴミ箱アイコンを取得
	const deleteIconFalse = document.getElementById('delete-icon-false'); // ゴミ箱アイコンを取得
	deleteIconTrue.style.display = isVisible ? 'inline' : 'none'; // 表示/非表示を切り替え
	deleteIconFalse.style.display = isVisible ? 'none' : 'inline'; // 表示/非表示を切り替え
}

// ヘッダーの削除レコード数の表示を切り替える関数
function selectedCount(isVisible) {
	const selectedCount = document.getElementById('selectedCount'); // 削除レコード数を取得
	selectedCount.style.display = isVisible ? 'inline' : 'none'; // 表示/非表示を切り替え
}

// 検索機能
let checkFlgTrue = false; // チェックありのレコード用フラグ
let checkFlgFalse = false; // チェックなしのレコード用フラグ
let lastSearchValue = ''; // 検索ボックスの最後の値を保持するための変数
let bookmarkSearchFlg = false; // ブックマークのレコード用フラグ
const filterInput = document.getElementById('filterInput'); // 現在の値を取得

// クリアボタン押下アクション
document.getElementById('clear').addEventListener('click', function() {
	doClear();
	search();
});

// 絞り込み条件解除
function doClear() {
	filterInput.value = ''; // テキストボックスの値を空にする
	lastSearchValue = ''; // 検索の最後の値もクリア
	checkFlgTrue = false;
	checkTrue.classList.remove('searchOptionSelected');
	checkFlgFalse = false;
	checkFalse.classList.remove('searchOptionSelected');
	bookmarkSearchFlg = false;
	bookmark.classList.remove('searchOptionSelected');
}

// 検索機能
function search() {
	const filterInputSearch = filterInput.value.toLowerCase(); // 小文字に変換して取得
	const checkTrueSelected = checkFlgTrue; // チェックありのフラグ
	const checkFalseSelected = checkFlgFalse; // チェックなしのフラグ
	const bookmarkSelected = bookmarkSearchFlg; // ブックマークのフラグ
	const cachedData = JSON.parse(localStorage.getItem('spreadsheetData')) || []; // キャッシュからデータを取得

	// フィルタリングされたデータを格納する配列
	const filteredData = cachedData.filter(row => {
		const matchesText = (typeof row[1] === 'string' || typeof row[1] === 'number') && 
				String(row[1]).toLowerCase().includes(filterInputSearch); // 2列目の値に基づくフィルタリング
		const matchesCheckbox = (checkTrueSelected && row[0] === true) || (checkFalseSelected && row[0] === false);
		const matchesBookmark = bookmarkSelected ? row[3] === true : true; // 4列目（ブックマーク）でフィルタリング

		return matchesText && (checkTrueSelected || checkFalseSelected ? matchesCheckbox : true) && matchesBookmark;
	});

	displayData(filteredData); // フィルタリングされたデータを表示
	sortList(sortMode);
	searchNone(); // 検索結果が0件の場合の表示制御
}

// チェックボタンのクリックイベント
const checkTrue = document.getElementById('checkTrue');
checkTrue.addEventListener('click', function() {
	checkFlgTrue = !checkFlgTrue; // フラグを切り替え
	if (checkFlgTrue) {
		checkFlgFalse = false;
		checkTrue.classList.add('searchOptionSelected');
		checkFalse.classList.remove('searchOptionSelected');
	} else {
		checkTrue.classList.remove('searchOptionSelected');
	}
	search();
});

const checkFalse = document.getElementById('checkFalse');
checkFalse.addEventListener('click', function() {
	checkFlgFalse = !checkFlgFalse; // フラグを切り替え
	if (checkFlgFalse) {
		checkFlgTrue = false;
		checkFalse.classList.add('searchOptionSelected');
		checkTrue.classList.remove('searchOptionSelected');
	} else {
		checkFalse.classList.remove('searchOptionSelected');
	}
	search();
});

filterInput.addEventListener('blur', function() {
	search();
	if (filterInput.value != '') {
		if (checkFlgTrue == true || checkFlgFalse == true) {
	}}
});

// ブックマークのクリックイベント
const bookmark = document.getElementById('bookmark');
bookmark.addEventListener('click', function() {
	bookmarkSearchFlg = !bookmarkSearchFlg; // フラグを切り替え
	if (bookmarkSearchFlg) {
		bookmark.classList.add('searchOptionSelected');
	} else {
		bookmark.classList.remove('searchOptionSelected');
	}
	search();
});

// 検索ボタン押下アクション
document.getElementById('searchButton').addEventListener('click', () => {
	lastSearchValue = filterInput.value; // 値を保持
	search();
	updateFilterIcon();
	sideMenu.classList.remove('open');
	modalOverlay.style.display = 'none';
	footerOverlay.style.display = 'none';
});

// 絞り込み条件の有無
function updateFilterIcon() {
	const tuneIconText = document.querySelector('#tune-icon span:last-child'); // <span>要素を取得
	// filter-reset-iconの表示を切り替える
	const filterResetIcon = document.getElementById('filter-reset-icon');
	if (checkFlgTrue == true || checkFlgFalse == true || bookmarkSearchFlg == true || filterInput.value != ''){
		tuneIconText.textContent = '絞り込み中'; // テキストを変更
		filterResetIcon.style.display = 'flex'; // 絞り込み中の場合、表示する
	} else {
		tuneIconText.textContent = '絞り込み'; // テキストを変更
		filterResetIcon.style.display = 'none'; // 絞り込み中の場合、表示する
	}
}

// 絞り込み条件リセットアクション
const filterResetIcon = document.getElementById('filter-reset-icon');
filterResetIcon.addEventListener('click', () => {
	doClear();
	search();
	updateFilterIcon();
});

// 検索結果が0件の場合の表示制御
const searchNoneScreen = document.getElementById('searchNoneScreen');
function searchNone() {
	const isSearchNoneScreen = currentData.length === 0;
	searchNoneScreen.style.display = isSearchNoneScreen ? 'inline' : 'none';
	const deleteIconFalse = document.getElementById('delete-icon-false'); // ゴミ箱アイコンを取得
	deleteIconFalse.style.display = isSearchNoneScreen ? 'none' : 'inline'; // 表示/非表示を切り替え
}

const resetSerch = document.getElementById('resetSerch');
resetSerch.addEventListener('click', () => {
	doClear();
	search();
	updateFilterIcon();
});

// プルダウン表示
const sortIcon = document.getElementById('sort-icon');
const sortDropdown = document.getElementById('sort-dropdown');
let sortMode = 'insert';
let sort = 'desc';

const ascIcon = document.getElementById('asc-icon');
const descIcon = document.getElementById('desc-icon');
descIcon.classList.add('actionButtonSelected'); // 初期状態でasc-iconを赤に

// 昇順、降順ボタンのクリックイベント
ascIcon.addEventListener('click', function() {
	sort = 'asc'; // フラグを切り替え
	if (sort === 'asc') {
		ascIcon.classList.add('actionButtonSelected');
		descIcon.classList.remove('actionButtonSelected');
	} else {
		ascIcon.classList.remove('actionButtonSelected');
	}
	sortList(sortMode);
});

descIcon.addEventListener('click', function() {
	sort = 'desc'; // フラグを切り替え
	ascIcon.classList.remove('#asc-icon');
	if (sort === 'desc') {
		descIcon.classList.add('actionButtonSelected');
		ascIcon.classList.remove('actionButtonSelected');
	} else {
		descIcon.classList.remove('actionButtonSelected');
	}
	sortList(sortMode);
});

// sort-iconをクリックしたときにプルダウンを表示
sortIcon.addEventListener('click', () => {
	sortDropdown.style.display = sortDropdown.style.display === 'block' ? 'none' : 'block';
});

// 並び替えプルダウンをクリックしたときの処理
const sortInsert = document.getElementById('sort-insert');
sortInsert.addEventListener('click', () => {
	// 追加日時の処理をここに追加
	sortMode = 'insert';
	sortList(sortMode);
	sortDropdown.style.display = 'none'; // プルダウンを非表示にする
});

const sortUpdate = document.getElementById('sort-update');
sortUpdate.addEventListener('click', () => {
	// 更新日時の処理をここに追加
	sortMode = 'update';
	sortList(sortMode);
	sortDropdown.style.display = 'none'; // プルダウンを非表示にする
});

const sortCook = document.getElementById('sort-cook');
sortCook.addEventListener('click', () => {
	// 料理名の処理をここに追加
	sortMode = 'cook';
	sortList(sortMode);
	sortDropdown.style.display = 'none'; // プルダウンを非表示にする
});

const sortCheckbox = document.getElementById('sort-checkbox');
sortCheckbox.addEventListener('click', () => {
	// チェックボックスの処理をここに追加
	sortMode = 'checkbox';
	sortList(sortMode);
	sortDropdown.style.display = 'none'; // プルダウンを非表示にする
});

// リストをソートする関数
function sortList(order) {
	currentData.sort((a, b) => {

		const aValue = String(a[1]); // 明示的に文字列に変換
		const bValue = String(b[1]); // 明示的に文字列に変換
		const ainsertTimestamp = new Date(a[4]); // E列の値を日時に変換
		const binsertTimestamp = new Date(b[4]); // E列の値を日時に変換
		const aupdateTimestamp = new Date(a[5]); // F列の値を日時に変換
		const bupdateTimestamp = new Date(b[5]); // F列の値を日時に変換

		// ①追加日時に基づいてソート
		if (order === 'insert' && sort === 'asc') {
			if (!a[4] && !b[4]) return 0; // 両方空の場合はそのまま
			if (!a[4]) return 1; // aが空の場合はbを上に
			if (!b[4]) return -1; // bが空の場合はaを上に
			return ainsertTimestamp - binsertTimestamp; // 昇順でソート
		} else if (order === 'insert' && sort === 'desc') {
			if (!a[4] && !b[4]) return 0; // 両方空の場合はそのまま
			if (!a[4]) return -1; // aが空の場合はbを上に
			if (!b[4]) return 1; // bが空の場合はaを上に
			return binsertTimestamp - ainsertTimestamp; // 降順でソート
		}
		// ②更新日時に基づいてソート
		if (order === 'update' && sort === 'asc') {
			if (!a[5] && !b[5]) return 0; // 両方空の場合はそのまま
			if (!a[5]) return 1; // aが空の場合はbを上に
			if (!b[5]) return -1; // bが空の場合はaを上に
			return aupdateTimestamp - bupdateTimestamp; // 昇順でソート
		} else if (order === 'update' && sort === 'desc') {
			if (!a[5] && !b[5]) return 0; // 両方空の場合はそのまま
			if (!a[5]) return -1; // aが空の場合はbを上に
			if (!b[5]) return 1; // bが空の場合はaを上に
			return bupdateTimestamp - aupdateTimestamp; // 降順でソート
		}
		// ③テキストに基づいてソート
		if (order === 'cook' && sort === 'asc') {
			// 表示テキストを文字列として比較
			return aValue.localeCompare(bValue); // 昇順でソート
		} else if (order === 'cook' && sort === 'desc') {
			// 表示テキストを文字列として比較
			return bValue.localeCompare(aValue); // 降順でソート
		}
		// ④チェックボックスの状態に基づいてソート
		if (order === 'checkbox' && sort === 'asc') {
			if (a[0] === true && b[0] === false) {
				return -1; // aを上に
			} else if (a[0] === false && b[0] === true) {
				return 1; // bを上に
			} else {
				return 0; // 同じ場合はそのまま
			}
		} else if (order === 'checkbox' && sort === 'desc') {	
			if (a[0] === false && b[0] === true) {
				return -1; // aを上に
			} else if (a[0] === true && b[0] === false) {
				return 1; // bを上に
			} else {
				return 0; // 同じ場合はそのまま
			}
		}
	});

	// ソートされたcurrentDataをdisplayData関数に渡して表示
	displayData(currentData);
	// プルダウンの色を変更
	dropdownColor(sortMode);
	// 並び替えの条件テキストを変更
	updateDropdownIcon();
}

// プルダウンの色を変更
function dropdownColor(order) {
	if (order === 'insert') {
		sortInsert.classList.add('sort-top'); // クラスを追加
	} else {
		sortInsert.classList.remove('sort-top'); // クラスを削除
	}
	if (order === 'update') {
		sortUpdate.classList.add('sort-center'); // クラスを追加
	} else {
		sortUpdate.classList.remove('sort-center'); // クラスを削除
	}
	if (order === 'cook') {
		sortCook.classList.add('sort-center'); // クラスを追加
	} else {
		sortCook.classList.remove('sort-center'); // クラスを削除
	}
	if (order === 'checkbox') {
		sortCheckbox.classList.add('sort-bottom'); // クラスを追加
	} else {
		sortCheckbox.classList.remove('sort-bottom'); // クラスを削除
	}
}

// 並び替え条件のテキスト
function updateDropdownIcon() {
	const sortIconText = document.querySelector('#sort-icon span:last-child'); // <span>要素を取得
	if (sortMode == 'insert'){
		sortIconText.textContent = '追加日時順'; // テキストを変更
	} else if (sortMode == 'update') {
		sortIconText.textContent = '更新日時順'; // テキストを変更
	} else if (sortMode == 'cook') {
		sortIconText.textContent = '料理名順'; // テキストを変更
	} else if (sortMode == 'checkbox') {
		sortIconText.textContent = 'チェック順'; // テキストを変更
	}
}

// ドキュメントの他の部分がクリックされたときにプルダウンを閉じる
document.addEventListener('click', (event) => {
	if (!sortIcon.contains(event.target) && !sortDropdown.contains(event.target)) {
		sortDropdown.style.display = 'none';
	}
});

let lastScrollTop = 0; // 最後のスクロール位置
window.addEventListener('scroll', function() {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	if (scrollTop > lastScrollTop) {
		// スクロールダウン
		sortDropdown.style.display = 'none';
	} else {
		// スクロールアップ
		sortDropdown.style.display = 'none';
	}
	lastScrollTop = scrollTop; // 現在のスクロール位置を更新
});

// ヘルプページへ遷移
document.getElementById('help-icon').addEventListener('click', () => {
	window.location.href = 'index.html'; // 遷移先のページ
});