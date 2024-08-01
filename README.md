# BookSpy
Minecraft ChatTriggers modules that allows you to remotely read books and quills/written books held by other players.

## Usage
The main feature of BookSpy is the Book Logger which automatically alerts you when a player holds a book (either a book and quill or a written book). The Book Logger is enabled by default but can be disabled in settings (/bookspy).

When the Book Logger is enabled and a player holds an item the mod will automatically detect if it is a writable item (and if the item meets the logging criteria set in configurations) and if so it will alert you with a chat message with three options:
- [View] - Display a book GUI with the stolen book's contents completely clientside
- [Give] - Spawn the stolen book into your held item slot (must be in creative)
- [Copy] - Copy the NBT of the stolen book to your clipboard

## Commands
`/bookspy` - Open the configuration GUI
`/stealbook <player>` - Manual variation of the Book Logger.

## Coming Soon?
- Book cache to store all saved books and their contents
- Book library to let you easily browse saved books

# ⚠️ Disclaimer ⚠️
Use of this mod likely violates the rules on many major public servers and is intended for educational purposes/use on private servers only. I am not responsible if you are banned from any servers as a result of using this mod. 
