# 國家考試統計報表：UI/UX 示意

以「國家考試證書製發數量」為單頁設計範圍。提供可互動原型，方便投標提案討論與 GitHub Pages 展示。

## 設計調整

- 將年度及人員類別放在圖表上方；修改後即時更新，保留重設功能。
- 取消右側設定欄，讓圖表使用完整寬度。
- 僅提供適合年度比較的堆疊長條、並列長條及折線圖。
- 圖形設定收合為單一選單，支援數值標籤與水平格線。
- 下載集中右上角，支援 CSV、SVG、PNG、列印／另存 PDF。
- 圖表與資料表共用查詢條件；下载只包含已選取年度與類別。
- 以藍、青綠兩色區分類別；減少格線，年度文字保持水平。
- 支援手機版、鍵盤操作、空選取狀態及起訖年度同步校正。

## 資料聲明

**此原型所有數值均為示意資料**，依使用者提供的 91–114 年圖表截圖概略重建，未經正式統計資料核對。圖表、資料表、CSV 及圖檔皆標示示意資料。請勿引用於分析結論、正式報告或對外統計發布。

正式串接時，請以經確認的 API 或資料檔替换 `dist/app.js` 的 `DATA`。保留缺漏值為 null；正式版須區分缺漏與零，並增加資料更新日期、來源及統計定義。不得在資料尚未核驗前移除示意標示。

## 本機開啟

不需安裝套件或建置。直接開啟 `dist/index.html`，或在專案目錄執行：

```bash
python3 -m http.server 8000 --directory dist
```

開啟 http://localhost:8000 。

## GitHub Pages

下載 ZIP 並解壓，將**所有解壓後檔案**放入新的 GitHub 儲存庫根目錄。
在 Settings → Pages → Build and deployment → Source 選擇 **GitHub Actions**。
根目錄附有 `.github/workflows/pages.yml`，推送至 `main` 後會發布 `dist`。
也可改用 Deploy from a branch：將 `dist` 內的三個檔案放到儲存庫根目錄，選擇 `main / (root)`。

此原型不包含原標案附件、帳密、個人資料、追蹤工具或外部程式庫。

## 檔案

- `dist/index.html`：頁面結構。
- `dist/styles.css`：桌面、行動版與列印樣式。
- `dist/app.js`：示意資料、互動圖表與匯出。

## 設計參考

- 原始報表：https://stats.exam.gov.tw/exam/
- 觀光統計資料庫：https://stat.taiwan.net.tw/
- OPM 篩選區與留白參考：https://data.opm.gov/explore-data/analytics/workforce-size-and-composition

本案為獨立介面提案，並非上述機關正式網站。
