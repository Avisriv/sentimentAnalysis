# SentimentAnalysis

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.



import requests
import json

def translate_text_to_english(file_path, subscription_key):
    with open(file_path, 'r') as file:
        text = file.read()

    endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en"
    headers = {
        "Ocp-Apim-Subscription-Key": subscription_key,
        "Content-type": "application/json",
        "Ocp-Apim-Subscription-Region": "westeurope"  # Use the region where you have created the Azure Translator service
    }
    body = [{"text": text}]
    response = requests.post(endpoint, headers=headers, json=body)
    result = response.json()
    
    if response.status_code != 200:
        raise Exception(f"Translation failed: {result}")
    
    return result[0]['translations'][0]['text']

# Usage example
try:
    file_path = "input.txt"  # Replace with the path to your input text file
    subscription_key = "my_token"  # Replace with your actual API key
    translated_text = translate_text_to_english(file_path, subscription_key)
    print(translated_text)  # Should output the translated text
except Exception as e:
    print(e)
