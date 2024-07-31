// config.js
import { @Vigilant @SliderProperty @SwitchProperty @NumberProperty @TextProperty @ButtonProperty @SliderProperty @CheckboxProperty @SelectorProperty} from 'Vigilance';

@Vigilant("BookSpy", "BookSpy")
class Settings {
    @SwitchProperty({
        name: 'Book Spy',
        description: 'Log all books held by players.',
        category: 'Config'
    })
    bookSpy = true;

    @SwitchProperty({
        name: 'Record Self',
        description: 'Record books held by yourself.',
        category: 'Config'
    })
    recordSelf = false;

    @SwitchProperty({
        name: 'Author Filter',
        description: 'Only record held books that are written by the holder.',
        category: 'Config'
    })
    authorFilter = false;

    @SwitchProperty({
        name: 'Book Repository (Coming Soon)',
        description: 'Store all encountered books in a file.',
        category: 'Config'
    })
    bookRepo = false;


    constructor() {
        this.initialize(this);
    }
}

export default new Settings();