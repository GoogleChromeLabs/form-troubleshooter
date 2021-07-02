# Form troubleshooter

Chrome extension to find and fix common form problems.

## How it works

The extension checks the current page for form and form field elements each time it's opened.

1. The extension icon is clicked to open [popup.html](popup.html).
1. popup.js [sends a message](js/popup.js#L44) to [content-script.js](js/content-script.js#L11) that 
the popup has opened.
1. content-script.js [gets data](js/popup.js#L31) for form and form field elements on the current page. 
1. content-script.js [stores the data]](js/popup.js#L39) using chrome.storage.
1. content-script.js [sends a message](js/content-script.js#L11) that element data has been stored.
1. On getting the message, popup.js [gets the data from chrome.storage](js/popup.js#L50).
1. popup.js [displays an overview](js/popup.js#L59) of form and form field data in popup.html.
1. popup.js [calls `runAudits()`](js/popup.js#L59), defined in [audits.js](js/audits.js), to check 
the form elements and attributes in the page.
1. audits.js [displays results](js/audits.js#L57) of the audits in popup.html.


## Feedback and feature requests

Feedback welcome.

* [Make a comment or request](https://forms.gle/Sm7DbKfLX3hHNcDp9)
* [File a bug](https://github.com/samdutton/form-troubleshooter/issues/new)

## TODO

* Change *Save as PDF* to *Save as HTML*.
* Link to and/or highlight problematic elements.
* Move code to create HTML out of audits.js.
* -Test for duplicate attributes, e.g. multiple `autocomplete` attributes.-  <= these are ignored by the browser HTML parser.
* -Check for forms in forms.- <= these are ignored by the browser HTML parser.
* Check for forms (or other elements) that don't have a closing tag.
* Suggest alternatives to invalid attribute names, e.g. for `autcomplete`.
* Convert `map(field => stringifyElement(field));` to a single function.
* Sort out form field/element naming (labels and buttons are not fields).
* Move constants to external files.

---

This is not a Google product.
