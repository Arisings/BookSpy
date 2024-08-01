/// <reference types="../CTAutocomplete" />

import CreativeTab from '../CreativeTabs'

import Settings from './config.js'

const prefix = '§7[§6BookSpy§7]§r';
const UUID = Java.type('java.util.UUID')
const creativePacket = Java.type("net.minecraft.network.play.client.C10PacketCreativeInventoryAction");

///////////
// UTILS //
///////////

function loadSaved() {
    return JSON.parse(FileLib.read('BookSpy', './saved.json'))
}

function uploadSaved(contents) {
    FileLib.write('BookSpy', './saved.json', JSON.stringify(contents, null, 4))
}

function updateTab() {
    let itemsToAdd = [];
    Object.values(bookRepo).forEach(nbtStr => {
        let item = getItemFromNBT(nbtStr).getItemStack()
        itemsToAdd.push(item)
    })
    logTab.setItems(itemsToAdd)
}

function bookAlertMessage(p, item) {
    let uuid;

    // See if item already has associated uuid
    if (!Object.keys(bookRepo).find(id => bookRepo[id] === item.getRawNBT())) {
        uuid = UUID.randomUUID();
        bookRepo[uuid] = item.getRawNBT()

        if (Settings.saveBooks) uploadSaved(bookRepo);

        if (Settings.logTab) {
            updateTab()
        }
    } else {
        uuid = Object.keys(bookRepo).find(id => bookRepo[id] === item.getRawNBT())
    }

    let alertMessage = new Message(`${prefix} §f${p.getName()} §bis holding `, item.getTextComponent(), `\n`);
    alertMessage.addTextComponent(`§aOptions: `)
    alertMessage.addTextComponent(new TextComponent('§9[View]').setClick('run_command', `/bookspyaction -v ${uuid}`).setHoverValue('§eDisplay the book\'s content'))
    alertMessage.addTextComponent(new TextComponent(` `));
    alertMessage.addTextComponent(new TextComponent('§a[Give]').setClick('run_command', `/bookspyaction -g ${uuid}`).setHoverValue('§eSpawn the book in your held item slot. (Must be in creative mode)'))
    alertMessage.addTextComponent(new TextComponent(` `));
    alertMessage.addTextComponent(new TextComponent('§6[Copy]').setClick('run_command', `/bookspyaction -c ${uuid}`).setHoverValue('§eCopy the book\'s NBT to your clipboard'))
    alertMessage.chat()
}

function getItemFromNBT(nbtStr) {
    let nbt = net.minecraft.nbt.JsonToNBT.func_180713_a(nbtStr); // Get MC NBT object from string
    let count = nbt.func_74771_c('Count') // get byte
    let id = nbt.func_74779_i('id') // get string
    let damage = nbt.func_74765_d('Damage') // get short
    let tag = nbt.func_74781_a('tag') // get tag
    let item = new Item(id); // create ct item object
    item.setStackSize(count);
    item = item.getItemStack(); // convert to mc object
    item.func_77964_b(damage); // set damage of mc item object
    if (tag) item.func_77982_d(tag); // set tag of mc item object
    item = new Item(item); // convert back to ct object
    return item;
}

/////////////////
// BOOK LOGGER //
/////////////////

let lastHeldItem = {}; register('worldload', () => { lastHeldItem = {}; if (Settings.logTab) updateTab() })
let bookRepo = loadSaved(); register('gameUnload', () => { if (Settings.saveBooks) uploadSaved(bookRepo) })
register('tick', () => {
    if (!Settings.bookLogging) return;

    World.getAllPlayers().forEach(p => {
        if (!Settings.recordSelf && p.getName() === Player.getName()) return;

        let item = p.getItemInSlot(0);
        if (!item || (item.getID() !== 386 && item.getID() !== 387)) {
            if (lastHeldItem[p.getUUID()] !== null) lastHeldItem[p.getUUID()] = null
            return;
        }
        if (Settings.recordAuthor && item.getNBT().toObject().tag && item.getNBT().toObject().tag.author && item.getNBT().toObject().tag.author !== p.getName()) return; // Author filter
        if (lastHeldItem[p.getUUID()] === item.getRawNBT()) return; // Already checked
        lastHeldItem[p.getUUID()] = item.getRawNBT();

        if (item.getNBT().toObject().tag && item.getNBT().toObject().tag.pages && item.getNBT().toObject().tag.pages.length > 0 && item.getNBT().toObject().tag.pages.filter(page => page.length > 0).length > 0) { // Scenario: written book with writing
            // Don't record repeats
            if (!Settings.recordRepeats && Object.values(bookRepo).includes(item.getRawNBT())) return; // Already encountered

            bookAlertMessage(p, item)
        } else if (Settings.recordEmpty) { // Scenarios: book and quill not yet written in; written book missing pages tag; written book with no writing
            let alertMessage = new Message(`${prefix} §f${p.getName()} §bis holding empty book `, item.getTextComponent());
            alertMessage.chat()
        }
    })
})

register('command', (action, uuid) => {
    if (!action) return;
    if (!bookRepo[uuid]) return ChatLib.chat(`§cCould not resolve action.`);;
    let bookItem = getItemFromNBT(bookRepo[uuid]);

    if (action === "-v") { // view
        let book = new Book(bookItem.getName());
        if (bookItem.getNBT().get('tag') && bookItem.getNBT().get('tag').get('pages')) {
            let pages = new NBTTagList(bookItem.getNBT().get('tag').getTagList('pages', 8));
            book.updateBookScreen(pages);
        }
        book.display();
    } else if (action === "-g") { // give
        if (!Player.asPlayerMP().player.field_71075_bZ.field_75098_d) return ChatLib.chat(`§cYou must be in creative mode to perform this action.`);
        Client.sendPacket(new creativePacket(Player.getHeldItemIndex() + 36, bookItem.itemStack))
        new Message(`${prefix} §7Added `, bookItem.getTextComponent(), ` §7to your inventory`).chat();
    } else if (action === "-c") { // copy nbt
        ChatLib.command(`ct copy ${bookItem.getRawNBT()}`, true)
        new Message(`${prefix} §7Copied NBT of `, bookItem.getTextComponent(), ` §7to clipboard`).chat()
    }
}).setName('bookspyaction')

// Logged book creative tab
const logTab = CreativeTab.createTab("logged_books");
logTab.setTitle("Logged Books")
logTab.setIcon(getItemFromNBT(`{id:"minecraft:written_book",Count:1b,tag:{pages:[0:"\"Arisings was here ;)\""],author:"Arisings",title:"secret",resolved:1b},Damage:0s}`).getItemStack())
logTab.setSearchBar(true);

//////////////
// COMMANDS //
//////////////

register('command', () => {
    Settings.openGUI();
}).setName('bookspy').setAliases(['bs'])

register('command', () => {
    ChatLib.chat(JSON.stringify(Object.keys(bookRepo)))
    ChatLib.chat(`${prefix} §aCleared §2${Object.keys(bookRepo).length} §asaved entries.`)
    bookRepo = {};
    uploadSaved(bookRepo)
}).setName('bookspyclearsaved').setAliases(['bsclearsaved'])

register('command', (player) => {
    if (!player) return ChatLib.chat(`${prefix} §cInvalid Usage! /stealbook <player>`)
    let p = World.getAllPlayers().find(p => player.toLowerCase() === p.getName().toLowerCase())
    if (!p) return ChatLib.chat(`${prefix} §cCould not find player!`)
    let item = p.getItemInSlot(0);
    if (!item || (item.getID() !== 386 && item.getID() !== 387)) return ChatLib.chat(`${prefix} §cThat player is not holding a book!`)

    bookAlertMessage(p, item)
}).setName('stealbook').setAliases(['sb'])
