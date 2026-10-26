use std::{io::{self, stdout}, time::Duration};
use crossterm::{cursor, event::{self, Event, KeyCode, KeyEventKind}, execute, terminal};
use ratatui::{backend::CrosstermBackend, layout::{Constraint, Direction, Layout}, style::{Color, Style}, widgets::{Block, Paragraph}, Terminal};
fn main() -> io::Result<()> {
 let mut out=stdout();
 terminal::enable_raw_mode()?;
 execute!(out, terminal::Clear(terminal::ClearType::All), cursor::MoveTo(0,0))?;
 let mut term=Terminal::new(CrosstermBackend::new(out))?;
 let mut input=String::new();
 let mut lines=vec!["Gmail Doctor | Codex terminal renderer spike".to_owned(), "No Gmail API access. No account changes.".to_owned()];
 let result=(||->io::Result<()>{
 loop {
  term.draw(|f|{
   let areas=Layout::default().direction(Direction::Vertical).constraints([Constraint::Min(1),Constraint::Length(3),Constraint::Length(1)]).split(f.area());
   let visible=areas[0].height as usize;
   let start=lines.len().saturating_sub(visible);
   f.render_widget(Paragraph::new(lines[start..].join("\n")).style(Style::default().fg(Color::White)),areas[0]);
   f.render_widget(Paragraph::new(format!("› {input}")).block(Block::bordered().title("Command")),areas[1]);
   f.render_widget(Paragraph::new("/many: 100 synthetic lines | /quit: exit").style(Style::default().fg(Color::DarkGray)),areas[2]);
  })?;
  if event::poll(Duration::from_millis(100))? {
   if let Event::Key(key)=event::read()?{
    if key.kind!=KeyEventKind::Press {continue;}
    match key.code {
     KeyCode::Char(ch)=>input.push(ch),
     KeyCode::Backspace=>{input.pop();},
     KeyCode::Esc=>break,
     KeyCode::Enter=>{
      let cmd=input.trim().to_string();input.clear();
      if cmd=="/quit" {break;}
      if cmd=="/many" {for i in 0..100 {lines.push(format!("Read-only test event #{}",i+1));}}
      else {lines.push(format!("Input: {cmd}"));}
     }
     _=>{}
    }
   }
  }
 }
 Ok(())
 })();
 term.show_cursor()?;
 terminal::disable_raw_mode()?;
 result
}
