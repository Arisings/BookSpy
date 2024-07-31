/// <reference types="../CTAutocomplete" />

import Settings from './config.js'

const prefix = '§7[§6BookSpy§7]§r';

const UUID = Java.type('java.util.UUID')
const creativePacket = Java.type("net.minecraft.network.play.client.C10PacketCreativeInventoryAction");

let itemCache = {}
register('tick', () => {
    if (!Settings.bookSpy) return;
    World.getAllPlayers().forEach(p => {
        if (!Settings.recordSelf && p.getName() === Player.getName()) return;
        let item = p.getItemInSlot(0);
        if (!item || (item.getID() !== 386 && item.getID() !== 387)) return;
        if (Settings.authorFilter && item.getNBT().toObject().tag && item.getNBT().toObject().tag.author && item.getNBT().toObject().tag.author !== p.getName()) return; // Author filter
        if (Object.values(itemCache).some(i => item.getRawNBT() === i.getRawNBT())) return; // Already encountered

        const uuid = UUID.randomUUID();
        itemCache[uuid] = item;

        if (item.getNBT().toObject().tag && item.getNBT().toObject().tag.pages && item.getNBT().toObject().tag.pages.length > 0 && item.getNBT().toObject().tag.pages.filter(page => page.length > 0).length > 0) { // Scenario: written book with writing
            let alertMessage = new Message(`${prefix} §f${p.getName()} §bis holding `, item.getTextComponent(), `\n`);
            alertMessage.addTextComponent(`§aOptions: `)
            alertMessage.addTextComponent(new TextComponent('§9[View]').setClick('run_command', `/bookspyaction -v ${uuid}`).setHoverValue('§eDisplay the book\'s content'))
            alertMessage.addTextComponent(new TextComponent(` `));
            alertMessage.addTextComponent(new TextComponent('§a[Give]').setClick('run_command', `/bookspyaction -g ${uuid}`).setHoverValue('§eSpawn the book in your held item slot. (Must be in creative mode)'))
            alertMessage.addTextComponent(new TextComponent(` `));
            alertMessage.addTextComponent(new TextComponent('§6[Copy]').setClick('run_command', `/bookspyaction -c ${uuid}`).setHoverValue('§eCopy the book\'s NBT to your clipboard'))
            alertMessage.chat()
        } else { // Scenarios: book and quill not yet written in; written book missing pages tag; written book with no writing
            let alertMessage = new Message(`${prefix} §f${p.getName()} §bis holding pageless book `, item.getTextComponent());
            alertMessage.chat()
        }
    })
})

register('command', (action, uuid) => {
    if (!action) return;
    let bookItem = itemCache[uuid];
    if (!bookItem) return ChatLib.chat(`§cAction token expired.`);

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

// open gui
register('command', () => {
    Settings.openGUI();
}).setName('bookspy')