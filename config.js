// config.js
import { @Vigilant @SliderProperty @SwitchProperty @NumberProperty @TextProperty @ButtonProperty @SliderProperty @CheckboxProperty @SelectorProperty} from 'Vigilance';

@Vigilant("BookSpy", "BookSpy")
class Settings {
    @SwitchProperty({
        name: 'Book Logging',
        description: 'Automatically log books held by other players in chat.',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    bookLogging = true;

    @SliderProperty({
        name: 'Check Interval',
        description: 'How often in ticks the module should scan all players for books. Setting this to a low number will allow maximum precision for book scanning, however, it may cause greater lag on lower-end machines.\n(20 ticks = 1 second)',
        category: 'Config',
        subcategory: 'Book Logging',
        min: 1,
        max: 100,
    })
    ticks = 1;

    @SwitchProperty({
        name: 'Record Empty Books',
        description: 'Whether or not pageless books should be logged.',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    recordEmpty = false;

    @SwitchProperty({
        name: 'Record Repeats',
        description: 'Whether or not books that have been encountered before should be logged.\nMake sure §bSave Logged Books §7is §aenabled§7 for the best result.',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    recordRepeats = false;

    @SwitchProperty({
        name: 'Record Self',
        description: 'Whether or not books held by yourself should be logged.',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    recordSelf = false;

    @SwitchProperty({
        name: 'Record Authors Only',
        description: 'Whether or not only books which are held by the original author should be logged.',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    recordAuthor = false;

    @SwitchProperty({
        name: 'Save Logged Books',
        description: 'Save all logged books to a JSON file.\nWarning: If the save file gets too big it may cause a lot of lag when processing held books.',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    saveBooks = true;

    @SwitchProperty({
        name: 'Logged Books Creative Tab',
        description: 'Save all logged books to a Creative Tab, accessible in the creative inventory. (Have Save Logged Books enabled for best result)',
        subcategory: 'Book Logging',
        category: 'Config'
    })
    logTab = true;

    constructor() {
        this.initialize(this);
    }
}

export default new Settings();
