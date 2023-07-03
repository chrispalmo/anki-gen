# anki-gen

Anki-gen is a simple, web-based tool for creating Anki flashcards. It's primarily designed for Chinese language learners, with the ability to automatically translate Chinese text to Pinyin using the [hotoo/pinyin](https://github.com/hotoo/pinyin) library. Anki-gen allows you to create basic or cloze cards, and provides an easy way to input, review, and edit flashcards before exporting them for Anki import.

## Features

- Input text in a simple, clean interface.
- Automatically translate Chinese text to Pinyin.
- Define extra information for the back of the card.
- Create cloze deletions using a simple keyboard shortcut.
- Edit card details before exporting.
- Export flashcards in CSV format, ready for Anki import.

## Usage

1. Enter the Chinese text in the provided text area, separating each phrase by two new lines.

2. Press "Continue" to generate the Pinyin and preview the cards.

3. Edit the Chinese text, Pinyin, and extra information as needed.

4. Press "Export" to generate a CSV file that can be imported into Anki.

## Cloze Deletions

Create cloze deletions by selecting text in the "Front (Chinese)" field, and pressing `Ctrl+Shift+C`. The selected text will be replaced with a cloze deletion, with any copied text contained in the system clipboard being used as the hint.

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can run the app in the development mode by running `npm start`. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Remember to run `npm install` before starting the development server to install all dependencies.

## Contributing

Contributions are welcome! Feel free to open an issue or create a pull request.
