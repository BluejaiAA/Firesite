import { useState, useReducer, useRef, useCallback, useEffect } from "react";



/* ═══════════════════════════════════════════════════════════════════
   FIRESITE v4  ·  Professional Fire Risk Assessment Platform

   UX OVERHAUL:
   ✓ Card-by-card question flow — one question per screen
   ✓ Questions absorbed after answering (shorter as you go)
   ✓ Section start card with time estimate
   ✓ Section end celebration with stats summary
   ✓ Progress shown as filled dots per section (●●●○○) not numbers
   ✓ Skip logic — conditional questions hidden when irrelevant
   ✓ Sticky banner fixed — only title bar sticks, intro scrolls
   ✓ N/A answers excluded from report
   ✓ Empty observations excluded from report
   ✓ Auto-generated executive summary in report
   ✓ Positive findings section in report
   ✓ Quick-select responsible persons (remembers previous)
   ✓ Target date quick-pick (1 week / 1 month / 3 months / 12 months)
   ✓ Offline indicator
   ✓ Photo confirmation animation
   ✓ Priority auto-suggested by question category
   ✓ Answer chips on review
   ✓ Estimated completion time on dashboard
═══════════════════════════════════════════════════════════════════ */

// ─── SKIP LOGIC ───────────────────────────────────────────────────
// Questions that only show when a parent is answered a certain way
const SKIP_LOGIC = {
  "1.3":  { parent:"1.2",  showWhen:"y" },
  "1.4":  { parent:"1.3",  showWhen:"y" },
  "1.11": { parent:"1.10", showWhen:"y" },
  "1.14": { parent:"1.13", showWhen:"y" },
  "1.16": { parent:"1.15", showWhen:"y" },
  "2.7":  { parent:"2.6",  showWhen:"y" },
  "2.9":  { parent:"2.8",  showWhen:"y" },
  "2.11": { parent:"2.10", showWhen:"y" },
  "2.13": { parent:"2.12", showWhen:"y" },
  "4.2":  { parent:"4.1",  showWhen:"y" },
  "5.4":  { parent:"5.3",  showWhen:"y" },
  "5.5":  { parent:"5.3",  showWhen:"y" },
  "5.7":  { parent:"5.6",  showWhen:"y" },
  "5.8":  { parent:"5.3",  showWhen:"y" },
  "P1.7": { parent:"P1.5", showWhen:"y" },
  "R2.4": { parent:"R2.3", showWhen:"y" },
  "6.4":  { parent:"6.3",  showWhen:"y" },
  "6.6":  { parent:"6.5",  showWhen:"y" },
  "7.13": { parent:"7.12", showWhen:"y" },
  "7.14": { parent:"7.12", showWhen:"y" },
  "8.7":  { parent:"8.4",  showWhen:"y" },
  "9.2":  { parent:"9.1",  showWhen:"y" },
  "9.4":  { parent:"9.3",  showWhen:"y" },
};

// ─── PRIORITY BY SECTION ──────────────────────────────────────────
const SECTION_PRIORITY = {
  1:"P3 — Within 3 months", 2:"P3 — Within 3 months",
  3:"P3 — Within 3 months", 4:"P2 — Within 1 month",
  5:"P3 — Within 3 months", 6:"P3 — Within 3 months",
  7:"P1 — Immediate",       8:"P1 — Immediate",
  9:"P2 — Within 1 month",  10:"P2 — Within 1 month",
  11:"P3 — Within 3 months",12:"P4 — Within 12 months",
};

// ─── SMART ACTIONS ────────────────────────────────────────────────
const SMART_ACTIONS = {
  "7.9":  {action:"Remove deadlock from final exit door and replace with panic latch compliant with BS EN 1125. Implement immediately — door must not be locked during occupied hours.", priority:"P1 — Immediate"},
  "3.5":  {action:"Replace inoperative self-closing device on fire door. Door must close fully and latch from any open position including 90° under its own power.", priority:"P1 — Immediate"},
  "7.10": {action:"Replace key-operated lock on final exit door with single-operation release device. Implement immediately.", priority:"P1 — Immediate"},
  "8.4":  {action:"Arrange emergency inspection of fire alarm system by competent contractor. Do not rely on this premises having adequate fire warning until confirmed operational.", priority:"P1 — Immediate"},
  "3.4":  {action:"Arrange inspection of all fire doors by a competent fire door inspector. Repair or replace defective doors. Maintain log of all fire door inspections.", priority:"P2 — Within 1 month"},
  "3.9":  {action:"Adjust or replace fire doors where gap tolerances exceed 3mm at sides/top or 8mm at threshold. Commission competent fire door contractor.", priority:"P2 — Within 1 month"},
  "3.10": {action:"Fit intumescent strips and cold smoke seals to all fire doors where these are missing or damaged.", priority:"P2 — Within 1 month"},
  "8.11": {action:"Reposition any obstructions to manual call points. Maintain minimum 500mm clear access at all times.", priority:"P2 — Within 1 month"},
  "7.12": {action:"Test all emergency lighting units and replace any failed luminaires. Arrange full 3-hour discharge test and retain certificate.", priority:"P2 — Within 1 month"},
  "7.7":  {action:"Clear all obstructions from escape corridors. Implement management controls to ensure routes remain clear. Brief all staff.", priority:"P2 — Within 1 month"},
  "2.3":  {action:"Commission an Electrical Installation Condition Report (EICR) from a competent electrical contractor.", priority:"P2 — Within 1 month"},
  "8.9":  {action:"Establish weekly fire alarm call point test programme and record in log book. Arrange 6-monthly service.", priority:"P2 — Within 1 month"},
  "1.9":  {action:"Remove accumulated combustible waste. Implement weekly housekeeping inspection regime with records.", priority:"P3 — Within 3 months"},
  "9.8":  {action:"Introduce monthly visual checks for all portable fire extinguishers recorded in the fire safety log.", priority:"P3 — Within 3 months"},
  "6.5":  {action:"Arrange evacuation drill within 3 months. Record date, time, evacuation time, total evacuees and issues identified.", priority:"P3 — Within 3 months"},
  "2.1":  {action:"Introduce a programme of portable appliance testing (PAT) appropriate to the risk level and frequency of use.", priority:"P3 — Within 3 months"},
  "R2.3": {action:"Arrange suitable fire safety management training for the Responsible Person from a recognised body.", priority:"P3 — Within 3 months"},
  "6.2":  {action:"Arrange fire safety awareness training for all staff covering: alarm raising, evacuation procedure, assembly point and extinguisher awareness.", priority:"P3 — Within 3 months"},
  "6.3":  {action:"Identify and train a sufficient number of Fire Wardens including practical use of firefighting equipment.", priority:"P3 — Within 3 months"},
  "4.4":  {action:"Relocate external waste containers to a designated area away from the building structure.", priority:"P3 — Within 3 months"},
};

// ─── SECTION INTROS ───────────────────────────────────────────────
const SECTION_INTROS = {
  1:  {icon:"🏢", colour:"#C0392B", text:"Record the address, construction type and occupancy. This determines which standards apply.", mins:2},
  2:  {icon:"👤", colour:"#C0392B", text:"Identify the Responsible Person under Article 3 of the RRO 2005 — the person with control of the premises.", mins:2},
  3:  {icon:"🔥", colour:"#DC2626", text:"Walk the entire premises. Consider all ignition sources and combustible materials — permanent and temporary.", mins:5},
  4:  {icon:"⚡", colour:"#D97706", text:"Ask to see the EICR and PAT records. Check for visible cable or equipment defects.", mins:3},
  5:  {icon:"🔒", colour:"#374151", text:"Consider the likelihood of deliberate fire-raising. Assess external fuel loads, lighting and CCTV.", mins:2},
  6:  {icon:"👥", colour:"#C0392B", text:"Identify all persons present, paying attention to those needing additional assistance to evacuate.", mins:3},
  7:  {icon:"🚪", colour:"#059669", text:"Walk every escape route to the final exit. Test every door. Do not rely on plans — check what is actually there.", mins:5},
  8:  {icon:"🔥", colour:"#DC2626", text:"Use a gap gauge to test door tolerances. Check self-closers under load from 90°. Look for wedges or props.", mins:4},
  9:  {icon:"🔔", colour:"#C0392B", text:"Test the fire alarm if possible. Check the log book for weekly test records. Review the latest service certificate.", mins:3},
  10: {icon:"🧯", colour:"#D97706", text:"Check service labels, gauges and positions. Confirm extinguisher types match the identified fire risks.", mins:3},
  11: {icon:"📋", colour:"#374151", text:"Ask to see the fire safety log book and training evidence. Good management significantly reduces risk.", mins:4},
  12: {icon:"⚖️", colour:"#C0392B", text:"Based on all findings, determine the overall risk rating. This must be defensible if challenged.", mins:2},
};
const FRA_SECTIONS = [
  { id:1, title:"Premises Details", short:"Premises", questions:[
    {ref:"P1.1",q:"State the full address of the premises under assessment.",t:"text",required:true},
    {ref:"P1.2",q:"Describe the primary use and occupancy of the premises.",t:"text",required:true},
    {ref:"P1.3",q:"State the approximate floor area (m²) and number of floors.",t:"text",required:true},
    {ref:"P1.4",q:"What is the approximate maximum number of occupants at any one time?",t:"select",opts:["1–10","11–20","21–50","51–100","101–250","251–500","500+"],required:true},
    {ref:"P1.5",q:"Are any parts of the premises used for sleeping accommodation?",t:"yn",required:true,g:"Sleeping risk fundamentally changes the required level of fire protection. If yes, automatic detection to BS 5839 is likely required throughout."},
    {ref:"P1.6",q:"Describe the construction type and approximate age of the building.",t:"text",required:false},
    {ref:"P1.7",q:"Have there been any recent alterations, extensions or changes of use to the building?",t:"yn",required:false,g:"Material changes may invalidate previous assessments and affect compartmentation, means of escape and the adequacy of existing fire precautions."},
  ]},
  { id:2, title:"Responsible Person", short:"Resp. Person", questions:[
    {ref:"R2.1",q:"State the name of the Responsible Person as defined under Article 3 of the RRO 2005.",t:"text",required:true},
    {ref:"R2.2",q:"State the Responsible Person's job title and contact details.",t:"text",required:true},
    {ref:"R2.3",q:"Has the Responsible Person undertaken appropriate fire safety management training?",t:"yn",required:true,g:"The Responsible Person must be competent. Ask for evidence of relevant training — courses from recognised bodies such as IFPO, IFE or equivalent."},
    {ref:"R2.4",q:"Name any other duty holders or persons with partial control of the premises.",t:"text",required:false},
    {ref:"R2.5",q:"Are fire safety responsibilities clearly documented and communicated to all relevant persons?",t:"yn",required:true},
  ]},
  { id:3, title:"Ignition Sources & Fuel Load", short:"Ignition & Fuel", questions:[
    {ref:"1.1",q:"Describe the main fuel sources identified within the building.",t:"text",required:true,g:"Look for: paper/cardboard, furniture, waste materials, floor/wall coverings, flammable liquids or gases, timber, textiles. Record type, quantity and location."},
    {ref:"1.2",q:"Could conditions within the premises give rise to a flammable or explosive atmosphere?",t:"yn",required:true,g:"Consider: LPG storage, solvent-based products, fuel storage, spray painting, commercial kitchens. If yes, a formal DSEAR assessment is required."},
    {ref:"1.3",q:"If yes to 1.2 — has a formal DSEAR assessment been completed?",t:"ynna",required:false},
    {ref:"1.4",q:"If yes to 1.3 — have the findings and actions been fully acted upon?",t:"ynna",required:false},
    {ref:"1.5",q:"Are flammable liquids, gases and combustible materials handled and stored safely?",t:"ynna",required:true},
    {ref:"1.6",q:"Are substances hazardous to fire safety managed with appropriate storage and handling controls?",t:"ynna",required:true},
    {ref:"1.7",q:"Are space heaters guarded, stable, and kept clear of combustibles?",t:"ynna",required:true},
    {ref:"1.8",q:"Is upholstered furniture in acceptable condition with no exposed foam?",t:"ynna",required:false},
    {ref:"1.9",q:"Is the building kept reasonably free from accumulated waste and unnecessary combustible material?",t:"yn",required:true,g:"Check: stairwells, plant rooms, roof spaces, under-stair cupboards, loading bays and external areas. Waste should not accumulate between collection points."},
    {ref:"1.10",q:"Is smoking permitted anywhere on the site, including outdoor areas?",t:"yn",required:true},
    {ref:"1.11",q:"If yes — are appropriate fire-safe receptacles provided for smoking waste?",t:"ynna",required:false},
    {ref:"1.12",q:"Was the site's smoking policy being followed at the time of this assessment?",t:"yn",required:true},
    {ref:"1.13",q:"Is a mains gas supply present in the building?",t:"yn",required:true},
    {ref:"1.14",q:"If yes — are gas appliances serviced annually by a Gas Safe registered engineer?",t:"ynna",required:false},
    {ref:"1.15",q:"Is an oil-based heating or fuel supply present?",t:"yn",required:false},
    {ref:"1.16",q:"If yes — are oil-fired appliances inspected annually by an OFTEC contractor?",t:"ynna",required:false},
    {ref:"1.17",q:"Are portable or plug-in heating devices in use anywhere within the premises?",t:"yn",required:true},
    {ref:"1.18",q:"Is there clear separation between combustible materials and identified ignition sources?",t:"ynna",required:true},
    {ref:"1.19",q:"Where cooking takes place, are adequate precautions in place to reduce the risk of fire?",t:"ynna",required:false},
    {ref:"1.20",q:"Are kitchen extraction canopies, filters and ductwork cleaned on a schedule appropriate to frequency of use?",t:"ynna",required:false},
  ]},
  { id:4, title:"Electrical Safety", short:"Electrical", questions:[
    {ref:"2.1",q:"Are portable electrical appliances subject to a regular programme of inspection and testing (PAT)?",t:"yn",required:true},
    {ref:"2.2",q:"At what interval is PAT currently carried out?",t:"select",opts:["Annually","1–2 Years","2–3 Years","3 Years+","Not conducted","N/A"],required:false},
    {ref:"2.3",q:"Is the fixed electrical installation tested periodically by a competent electrical engineer?",t:"ynna",required:true,g:"Ask to see the most recent EICR. Offices: every 5 years. Industrial: every 3 years. Check all C1, C2 and C3 coded items have been actioned."},
    {ref:"2.4",q:"How long ago was the most recent EICR carried out?",t:"select",opts:["Under 3 Years","3–5 Years","Over 5 Years","Not Conducted","N/A"],required:true},
    {ref:"2.5",q:"Have all C1, C2, C3 and FI items from the latest EICR been properly resolved?",t:"ynna",required:true},
    {ref:"2.6",q:"Are trailing leads, multi-way adaptors or extension blocks in use?",t:"yn",required:true},
    {ref:"2.7",q:"If yes — are the associated risks adequately controlled?",t:"ynna",required:false},
    {ref:"2.8",q:"Are electric vehicle (EV) charging facilities provided at or within the premises?",t:"yn",required:true},
    {ref:"2.9",q:"If yes — are appropriate fire safety controls in place for EV charging?",t:"ynna",required:false},
    {ref:"2.10",q:"Are lithium-ion, lead-acid or other batteries stored, charged or used on site?",t:"yn",required:true},
    {ref:"2.11",q:"If yes — are the fire risks from battery storage and charging adequately managed?",t:"ynna",required:false},
    {ref:"2.12",q:"Are solar photovoltaic (PV) panels or other renewable energy systems installed?",t:"yn",required:false},
    {ref:"2.13",q:"If yes — are the fire risks associated with the PV installation adequately controlled?",t:"ynna",required:false},
  ]},
  { id:5, title:"Arson Risk & Security", short:"Arson", questions:[
    {ref:"4.1",q:"Is there a credible arson risk associated with this building or its surrounding grounds?",t:"yn",required:true},
    {ref:"4.2",q:"If yes — are controls currently in place sufficient to reduce the risk to an acceptable level?",t:"ynna",required:false},
    {ref:"4.3",q:"Are security systems such as CCTV or an intruder alarm installed and operational?",t:"yn",required:true},
    {ref:"4.4",q:"Are external waste and refuse containers stored away from the building?",t:"ynna",required:true},
    {ref:"4.5",q:"Are external bins secured to prevent unauthorised access or deliberate ignition?",t:"ynna",required:false},
    {ref:"4.6",q:"Are combustible items stored at least 10 metres from the building structure?",t:"ynna",required:true},
  ]},
  { id:6, title:"People at Risk", short:"People at Risk", questions:[
    {ref:"5.1",q:"Which categories of person are present in or around the building?",t:"multi",opts:["Employees","Contractors","Lone Workers","Service Users","Visitors","General Public","Young Persons","Disabled Persons","Other"],required:true},
    {ref:"5.2",q:"Does the number of people typically present exceed the building's assessed maximum occupancy?",t:"yn",required:true},
    {ref:"5.3",q:"Are any occupants known to have a physical, sensory or cognitive condition affecting their ability to evacuate?",t:"yn",required:true,g:"Consider: mobility impairment, hearing or visual loss, mental health conditions, pregnancy, temporary injury, language barriers. This triggers PEEP requirements."},
    {ref:"5.4",q:"If yes — have Personal Emergency Evacuation Plans (PEEPs) or a GEEP been prepared?",t:"ynna",required:false},
    {ref:"5.5",q:"If yes — what evacuation aids are available?",t:"multi",opts:["Evacuation Chair","Evacuation Sledge / Mat","Carry Chair or Stretcher","Evacuation Lift","None","N/A"],required:false},
    {ref:"5.6",q:"Is it foreseeable that people unfamiliar with the building will be present?",t:"yn",required:true},
    {ref:"5.7",q:"If yes — what steps are taken to ensure the safe evacuation of unfamiliar visitors?",t:"text",required:false},
    {ref:"5.8",q:"Where refuge points are provided, are they suitably protected and accessible?",t:"ynna",required:false},
  ]},
  { id:7, title:"Means of Escape", short:"Escape Routes", questions:[
    {ref:"7.1",q:"What evacuation strategy applies to this building?",t:"select",opts:["Simultaneous (full evacuation)","Phased Evacuation","Stay Put (defend in place)","Other"],required:true},
    {ref:"7.2",q:"Do escape route travel distances fall within the limits set out in applicable guidance?",t:"yn",required:true},
    {ref:"7.3",q:"Are there sufficient final exits in both number and clear width?",t:"yn",required:true},
    {ref:"7.4",q:"Are escape corridors and stairways wide enough to accommodate all occupants?",t:"yn",required:true},
    {ref:"7.5",q:"If one escape route is unavailable, is an alternative accessible from all parts of the building?",t:"yn",required:true},
    {ref:"7.6",q:"Are all escape routes clearly signposted with compliant directional and pictographic signage?",t:"yn",required:true},
    {ref:"7.7",q:"Are escape corridors and walkways free from stored items that would hinder evacuation?",t:"yn",required:true},
    {ref:"7.8",q:"Are escape routes clear of hazards — raised thresholds, loose flooring or wet surfaces?",t:"yn",required:true},
    {ref:"7.9",q:"Are any final exits found to be locked, secured or obstructed during occupied hours?",t:"yn",required:true,g:"Test every final exit door. A locked final exit during occupied hours is an immediate Priority 1 finding requiring same-day remediation."},
    {ref:"7.10",q:"Can all final exit doors be opened immediately from inside by a single operation without a key?",t:"yn",required:true,g:"Push bars and lever handles are acceptable. Thumb-turn locks are acceptable. Key-operated locks on occupied exits are NOT acceptable. Test each door at time of visit."},
    {ref:"7.11",q:"Are escape routes and final exit areas adequately illuminated — internally and externally?",t:"yn",required:true},
    {ref:"7.12",q:"Where emergency lighting is installed, is it confirmed to be in working order?",t:"ynna",required:true},
    {ref:"7.13",q:"Is emergency lighting tested monthly and subjected to a full 3-hour discharge test annually?",t:"ynna",required:true},
    {ref:"7.14",q:"Where external metal fire escape staircases exist, have they been structurally inspected within 5 years?",t:"ynna",required:false},
    {ref:"7.15",q:"Is a formal assembly point designated and known to all occupants? State its location.",t:"text",required:true},
    {ref:"7.16",q:"Describe the arrangements used to confirm that all occupants, including visitors, have evacuated.",t:"text",required:true},
  ]},
  { id:8, title:"Fire Doors & Compartmentation", short:"Fire Doors", questions:[
    {ref:"3.1",q:"Are there building features that could cause fire to spread more rapidly than expected? (voids, ductwork, cladding)",t:"yn",required:true},
    {ref:"3.2",q:"Could smoke travel between spaces, floors or compartments in a way that presents a risk to life?",t:"yn",required:true},
    {ref:"3.3",q:"Where suspended or false ceilings are present, have fire-stopping measures been incorporated?",t:"ynna",required:false},
    {ref:"3.4",q:"Are fire-rated doors installed where required, properly specified, fitted and maintained?",t:"ynna",required:true},
    {ref:"3.5",q:"Do the self-closing mechanisms on all fire doors operate effectively and reliably?",t:"ynna",required:true,g:"Open each fire door to 90° and release. It must close fully and latch under its own power. Closers held open with wedges, furniture or free-standing magnets not linked to the alarm are an immediate finding."},
    {ref:"3.6",q:"Are fire doors clearly identified with appropriate signage and kept closed when not in use?",t:"ynna",required:true},
    {ref:"3.7",q:"Do any fire doors have ventilation grilles or openings that significantly reduce their effectiveness?",t:"ynna",required:false},
    {ref:"3.8",q:"Do final exit doors and doors on escape routes swing open in the direction of escape travel?",t:"yn",required:true},
    {ref:"3.9",q:"Are the door gaps within acceptable tolerances — maximum 3mm at sides/top, maximum 8mm at threshold?",t:"yn",required:true,g:"Use a gap gauge or 2p coin (approx 3mm) to test. Gaps over tolerance allow smoke and flame to bypass the door assembly. Check all fire doors — not a sample."},
    {ref:"3.10",q:"Are intumescent strips and cold smoke seals present and in good condition on all required doors?",t:"yn",required:true},
  ]},
  { id:9, title:"Fire Detection & Alarm", short:"Detection", questions:[
    {ref:"8.1",q:"Would a fire be detected quickly enough for the alarm to be raised before escape routes are compromised?",t:"yn",required:true},
    {ref:"8.2",q:"Can an alarm be raised by any person discovering a fire without putting themselves at risk?",t:"yn",required:true},
    {ref:"8.3",q:"Is the fire warning signal capable of being perceived throughout the entire building?",t:"yn",required:true},
    {ref:"8.4",q:"Is a fire alarm system installed and confirmed to be in working order?",t:"ynna",required:true},
    {ref:"8.5",q:"Specify the category and standard of the fire alarm system installed (e.g. BS 5839-1 Category L2, Category M).",t:"text",required:true},
    {ref:"8.6",q:"Is the alarm system's cause-and-effect configuration consistent with the evacuation strategy adopted?",t:"ynna",required:true},
    {ref:"8.7",q:"Is the fire alarm system connected to and monitored by a third-party Alarm Receiving Centre (ARC)?",t:"ynna",required:false},
    {ref:"8.8",q:"Does the alarm system have a standby power supply for mains failure?",t:"ynna",required:true},
    {ref:"8.9",q:"Is the alarm subject to daily visual checks, weekly call point tests and at least 6-monthly servicing?",t:"ynna",required:true,g:"Ask to see the fire alarm log book. Weekly test entries should name the call point tested (rotating through all points). 6-monthly service should show engineer name, certificate and any defects."},
    {ref:"8.10",q:"Identify the contractor responsible for periodic inspection and servicing of the alarm system.",t:"text",required:true},
    {ref:"8.11",q:"Are all manual call points readily visible, clearly identified and free from obstruction?",t:"ynna",required:true},
    {ref:"8.12",q:"Are appropriate measures in place to minimise the occurrence of false or unwanted fire signals?",t:"ynna",required:true},
  ]},
  { id:10, title:"Firefighting Equipment", short:"Firefighting", questions:[
    {ref:"9.1",q:"Is an automatic sprinkler or water suppression system installed in the building?",t:"yn",required:true},
    {ref:"9.2",q:"If yes — is the system tested and inspected at intervals specified in the maintenance contract?",t:"ynna",required:false},
    {ref:"9.3",q:"Are dry or wet rising mains installed within the building for fire service use?",t:"yn",required:true},
    {ref:"9.4",q:"If yes — does a contractor carry out a 6-monthly visual inspection and annual pressure test?",t:"ynna",required:false},
    {ref:"9.5",q:"Describe the types and distribution of portable extinguishers provided within the building.",t:"text",required:true},
    {ref:"9.6",q:"Is the type, number and distribution of portable extinguishers appropriate for the identified fire risks?",t:"yn",required:true},
    {ref:"9.7",q:"Is firefighting equipment sited in accessible, visible locations with clear identification signage?",t:"yn",required:true},
    {ref:"9.8",q:"Are portable extinguishers checked visually each month by a responsible person?",t:"yn",required:true},
    {ref:"9.9",q:"Is all firefighting equipment serviced at the required intervals by a competent contractor?",t:"yn",required:true},
    {ref:"9.10",q:"Identify the contractor responsible for maintenance and servicing of firefighting equipment.",t:"text",required:true},
  ]},
  { id:11, title:"Fire Safety Management & Training", short:"Management", questions:[
    {ref:"6.1",q:"Has the Responsible Person undertaken recognised fire safety management training?",t:"yn",required:true},
    {ref:"6.2",q:"Have all staff received fire safety awareness information appropriate to their role and the premises?",t:"yn",required:true},
    {ref:"6.3",q:"Has a sufficient number of staff been trained as Fire Wardens, including use of firefighting equipment?",t:"yn",required:true},
    {ref:"6.4",q:"Have relevant staff received instruction in the correct use of any evacuation aids available on site?",t:"ynna",required:false},
    {ref:"6.5",q:"Are evacuation drills carried out at a frequency appropriate to the risk, covering all occupants?",t:"yn",required:true,g:"Most premises: minimum annually. High-risk or high-occupancy: 6-monthly. Schools: termly. Ask to see drill records including time, date, evacuation time, issues identified and actions taken."},
    {ref:"6.6",q:"Do drills include scenarios where a primary exit route is unavailable?",t:"ynna",required:false},
    {ref:"6.7",q:"How frequently are evacuation drills currently being undertaken?",t:"select",opts:["Every 6 Months","Annually","Other Frequency","Not currently undertaken"],required:true},
    {ref:"6.8",q:"Is a written fire evacuation procedure in place and displayed clearly at appropriate locations?",t:"yn",required:true},
    {ref:"6.9",q:"Are arrangements in place to meet the fire service on arrival and provide relevant site information?",t:"yn",required:true},
    {ref:"6.10",q:"Does the organisation maintain a fire safety log or record book for the premises?",t:"yn",required:true},
    {ref:"6.11",q:"Are weekly fire alarm test results, drill records and service records retained and available for inspection?",t:"yn",required:true},
    {ref:"6.12",q:"Where contractors work on site, are fire safety conditions included within the scope of engagement?",t:"ynna",required:false},
    {ref:"6.13",q:"Is a permit-to-work or hot works authorisation system operated for activities generating heat or sparks?",t:"ynna",required:false},
  ]},
  { id:12, title:"Overall Risk Rating & Review", short:"Risk Rating", questions:[
    {ref:"OR.1",q:"What is the overall likelihood of fire occurring at these premises?",t:"select",opts:["Low — adequate controls in place, minimal hazards","Medium — some concerns identified, general controls adequate","High — significant deficiencies noted, inadequate controls"],required:true,g:"Base this on the totality of findings — ignition sources, fuel loads, controls in place and quality of management. Low requires positive evidence of control, not an absence of obvious hazards."},
    {ref:"OR.2",q:"What is the potential consequence of a fire at these premises?",t:"select",opts:["Slight — limited potential for harm","Moderate — some potential for serious harm or injury","Extreme — significant potential for fatalities or mass casualties"],required:true,g:"Consider: number of occupants, sleeping risk, mobility impairment, complexity of evacuation, proximity of fire service, building height and construction."},
    {ref:"OR.3",q:"State the overall fire risk rating for these premises.",t:"select",opts:["Low — no further action required beyond routine management","Medium — improvements required within a defined period","High — urgent action required, allocate considerable resources","Critical — immediate action required, consider restricting use of premises"],required:true},
    {ref:"OR.4",q:"State the recommended date for the next review of this fire risk assessment.",t:"text",required:true,g:"Low risk: 24 months. Medium risk: 12 months. High risk: 6 months. Critical: immediate review after remediation. Also review following any material change, fire incident or significant change in occupancy."},
    {ref:"OR.5",q:"Provide any additional observations, recommendations or notes for this assessment.",t:"text",required:false},
  ]},
];

const TOTAL_Q = FRA_SECTIONS.reduce((n,s)=>n+s.questions.length,0);

// ─── STATE ────────────────────────────────────────────────────────
// ─── STATE ────────────────────────────────────────────────────────
const INIT_ORG = {
  name:"", assessor:"", jobTitle:"", quals:"", email:"", phone:"",
  address:"", website:"", logo:null,
  primaryColor:"#1C1C1C", accentColor:"#C0392B",
  reportFooter:"", disclaimer:"", refPrefix:"FRA",
  assessType:"Type 1 — Non-Intrusive",
  recentPersons:[],  // remembered responsible persons
};

const makeAssessment = (n) => ({
  id:0, ref:"FRA-"+new Date().getFullYear()+"-"+String(n).padStart(3,"0"),
  clientName:"", clientContact:"", clientEmail:"", clientPhone:"",
  premisesName:"", premisesAddress:"", premisesType:"Office",
  assessmentDate:new Date().toISOString().split("T")[0],
  rpName:"", rpTitle:"",
  answers:{}, status:"draft",
  completedAt:null, savedAt:null, riskRating:null, nextReview:null,
  secIdx:0, qIdx:0,   // which section, which question within section
  mode:"card",        // "card" | "review"
});

const INIT = {
  screen:"landing",
  org:INIT_ORG,
  setupDone:false, setupStep:0,
  assessments:[],
  activeId:null,
  showMissed:false,
  justDone:null,
  showValidation:false,
  isOnline:true,
};

function reducer(state, action) {
  switch(action.type) {
    case "HYDRATE":       return {...action.state};
    case "SET_ORG":       return {...state, org:{...state.org,...action.p}};
    case "SETUP_STEP":    return {...state, setupStep:action.i};
    case "FINISH_SETUP":  return {...state, screen:"dashboard", setupDone:true, setupStep:0};
    case "EDIT_ORG":      return {...state, screen:"setup", setupStep:0};
    case "SET_ONLINE":    return {...state, isOnline:action.v};

    case "NEW_ASSESSMENT": {
      const id = Date.now();
      const a  = makeAssessment(state.assessments.length+1);
      a.id = id;
      return {...state, assessments:[...state.assessments,a], activeId:id, screen:"client-setup"};
    }
    case "SET_ACTIVE":    return {...state, activeId:action.id, screen:action.screen||"assessment"};
    case "UPDATE_ASSESSMENT": return {
      ...state,
      assessments:state.assessments.map(a=>a.id===state.activeId?{...a,...action.patch}:a)
    };
    case "ANS": return {
      ...state,
      assessments:state.assessments.map(a=>a.id===state.activeId
        ?{...a,answers:{...a.answers,[action.ref]:{...(a.answers[action.ref]||{}),...action.patch}},savedAt:action.ts}
        :a)
    };
    case "SEC": return {
      ...state,
      assessments:state.assessments.map(a=>a.id===state.activeId?{...a,secIdx:action.i,qIdx:0,mode:"card"}:a),
      showMissed:false, justDone:null,
    };
    case "Q_IDX": return {
      ...state,
      assessments:state.assessments.map(a=>a.id===state.activeId?{...a,qIdx:action.i}:a),
    };
    case "SET_MODE": return {
      ...state,
      assessments:state.assessments.map(a=>a.id===state.activeId?{...a,mode:action.mode}:a),
    };
    case "DONE":          return {...state, justDone:action.i};
    case "CLR_DONE":      return {...state, justDone:null};
    case "SHOW_MISSED":   return {...state, showMissed:true};
    case "HIDE_MISSED":   return {...state, showMissed:false};
    case "SHOW_VALIDATION":return {...state, showValidation:true};
    case "COMPLETE":      return {
      ...state, screen:"complete",
      assessments:state.assessments.map(a=>a.id===state.activeId
        ?{...a,status:"complete",completedAt:action.ts,riskRating:action.riskRating,nextReview:action.nextReview}
        :a)
    };
    case "UPDATE_ACTION": return {
      ...state,
      assessments:state.assessments.map(a=>a.id===state.activeId
        ?{...a,answers:{...a.answers,[action.ref]:{...a.answers[action.ref],actionStatus:action.status}}}
        :a)
    };
    case "REMEMBER_PERSON": {
      const persons = state.org.recentPersons||[];
      const updated = [action.name,...persons.filter(p=>p!==action.name)].slice(0,6);
      return {...state, org:{...state.org, recentPersons:updated}};
    }
    case "GO": return {...state, screen:action.screen, showMissed:false, showValidation:false};
    default:   return state;
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────
const isAnswered = (q, ans={}) => {
  if (q.t==="multi") return (ans.sel||[]).length>0;
  if (q.t==="text")  return !!(ans.ans||"").trim();
  return !!ans.ans;
};
const isMissed  = (q, ans) => q.required && !isAnswered(q, ans||{});
const fmtDate   = iso => iso?new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—";
const riskCol   = r => r?.startsWith("Critical")?"#B91C1C":r?.startsWith("High")?"#D97706":r?.startsWith("Medium")?"#E05A1A":"#059669";
const riskBg    = r => r?.startsWith("Critical")?"#FEF2F2":r?.startsWith("High")?"#FFFBEB":r?.startsWith("Medium")?"#FDF3EE":"#ECFDF5";
const pColor    = p => p?.includes("P1")?"#B91C1C":p?.includes("P2")?"#D97706":p?.includes("P3")?"#E05A1A":"#059669";
const pBg       = p => p?.includes("P1")?"#FEF2F2":p?.includes("P2")?"#FFFBEB":p?.includes("P3")?"#FDF3EE":"#ECFDF5";

// Add target date from shortcut
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate()+days);
  return d.toISOString().split("T")[0];
};

// Should a question be shown given current answers (skip logic)
const shouldShow = (q, answers) => {
  const rule = SKIP_LOGIC[q.ref];
  if (!rule) return true;
  return answers[rule.parent]?.ans === rule.showWhen;
};

// Get visible questions for a section
const visibleQs = (section, answers) =>
  section.questions.filter(q => shouldShow(q, answers));

// Count answered in visible questions only
const countAnswered = (section, answers) =>
  visibleQs(section, answers).filter(q => isAnswered(q, answers[q.ref]||{})).length;

// Estimate minutes remaining
const estMins = (assessments_obj, answers) => {
  const totalUnanswered = FRA_SECTIONS.reduce((n,s) =>
    n + visibleQs(s,answers).filter(q=>!isAnswered(q,answers[q.ref]||{})).length, 0);
  return Math.ceil(totalUnanswered * 0.25); // ~15 seconds per question
};

// ─── CSS ──────────────────────────────────────────────────────────

const _IMG0 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAABWGlDQ1BJQ0MgUHJvZmlsZQAAeJx9kLFLw1AQxr9WpaB1EB0cHDKJQ5SSCro4tBVEcQhVweqUvqapkMZHkiIFN/+Bgv+BCs5uFoc6OjgIopPo5uSk4KLleS+JpCJ6j+N+fO+74zggOW5wbvcDqDu+W1zKK5ulLSX1jAS9IAzm8Zyur0r+rj/j/T703k7LWb///43Biukxqp+UGcZdH0ioxPqezyXvE4+5tBRxS7IV8onkcsjngWe9WCC+JlZYzagQvxCr5R7d6uG63WDRDnL7tOlsrMk5lBNYxA48cNgw0IQCHdk//LOBv4BdcjfhUp+FGnzqyZEiJ5jEy3DAMAOVWEOGUpN3ju53F91PjbWDJ2ChI4S4iLWVDnA2Rydrx9rUPDAyBFy1ueEagdRHmaxWgddTYLgEjN5Qz7ZXzWrh9uk8MPAoxNskkDoEui0hPo6E6B5T8wNw6XwBA6diE8HYWhMAAAzeSURBVHja1VpNcx3Hdb339tfMm/cJgAAhVBBbRdpWZJbpTRhpo9+gjXb5BfEqP8RJ7Eo523jhkrPSD9AyLkksphxVFpINpiwJEkGQwPueNzPd032zaODx4eEBJFUEK+gFCvNev57uvveec+b0oLUlXOdGcM2bnP+HiCGE+A8AhBDiP4sNEZn5xUe/qP/S5/NLZkbEeBnnE+dwfibLCyCiuq6NMSGEEAIzG5MChDguIgEwADlXaW0ATu4dbzMfi5nnPQHAezefDZFY6Bacc1onAAEAAcA5q3XC7BFFCI4ZhJDO2TgHAHTOXrhHZTnT2nz66aeffPLJvXt/+7Of3d3f39/b2yOiO3d+WpbV/fv333vvPSnFbDbb3d09ODjQWnvvEVFKaa0lohAYEbTWeT5LEpPnOQBsbW3VdV3XtRBiPB4TkRDywYMHP/7xj8qyUkp2Ol3vPSJsb29/8803zWbz6Oh4Z+cNIhoMBo8ODvrH/Z///G5d19vb2xdGIG7b4eHhYDD4wx8++eMf/3s6nSZJOhgMWq1Wu906ODj46KOPDp88eefevc3NrV/96tc3b940xqRpOhgMRqPR7u5fTybjLMvG44nWajAY3rnz06+++urdd9/t9Xq/+c2/bW/fTNO0KIosyxDx/v37b7755uHhYZZls9ksScwHH3zw4Ye/l1J67+/du7e1tfnhh/+xs/PGYDB88OBBu93+xS/+4cIIVFVBJIbDwaNHj7a2bh4ePu50OkJIaytjkl6vW5bl0dGxMWZz8wYi7u3tdbvdqqyUVt57Zk6SZDabSSmZwXuvlNrcvHF4eJimjbW1tW+/3U+SlAiHw1EcYTweA0CapkLIjz/+WAjx/vvv7+39udFoxBVKKff399fXN7yvp9M8SczOzs5FtYcRRoUQRDJmIQCf5nGofU1IRBKA69oBgJQaIADEXI8FML8EAARg72shJHOo61opAxAAGECEUANArAfmEKEiprtSBoCZPTMwsxCK2SNiHPmyGogLYOZY8sywWPHxkzi5U3TiiyFhCVUQEc7uXPwlL3Q8QYJ5t3gXDnEeZz5cusUSjKKU+tngeDp1ZsbTJTEAAhEwA84ns9BOPo/D44sBLS+sa7GJS3/EHIKPt4gLYEQhpbxG/OUcA3gAPDPp2s7+8r9/qrzqZbTzw78Zjyd7e39eW1tLkiRN0+l0qpRyzhVFQURKqXa7nee5977VahVFMZlMkiRBxK2tLWPMa2ZiBgBXzfrHfdY9tPnODwERvPdHR0eIuL6+/sUXX/R6vXmKM/Pu7u53333XarWm06nWut/vG2Om02m329VaL+XuUnW9qhaLmAFIKV1MB1/+z3+hajZ0uH3n7xBfgVJaYuulT85/e1GLGDPv7JxbSiEEgCTr/OD227VzSSNDpNFo/PjwqZISEJrNbDyeEBEA1HWNRGliALDfH671OkKK4XDcbGZaq6IoELD2QQja2rxx8PiJlBE32bm6223PZsVar3t03J/NimazkSSJs26az5LElGXZ63WVlIPhSErpfWi1suk0b6SpUvLg8ZONjbXNGxsrIyCUUuc3z3sfAislQwiVtUpKBiBEZpBSIKL3PoQgpYxCkIicc0KIEAKRAOAI0Mwnak0pFQIDcO09AAgSAOxcHSEkdpJShuADMwAIohACEQkhXF0joNZqMQLLC1jE46qyg8FQSFGWlfc+SUyMYFlUSWIA0dfeWru+3rPWOlef3F7JoiiN1t77zc2NKwK38ykE5ylDCNJGKymVVABAhHk+a7VbSZLEpCx83Wo1hRDaGCklABZFYbTWSiHR4nZcXZszMUbcuC7NOovAZ2DUObvE2a9k+145dJ5Im1Pal/PbRHX1ymN+RUm0rIWYQQh1XrrFPI6TuHwvF3kKr4KxluGxXtZCQohrVAMhhNUoFAJbWzprW+3O0dHR119/rbWu6xoRhRBKKWPM3t7ezs6Oc67b7U4mE2bu9/vtdtsYw8ztdnt3d3clxb447760FooF8OWXX/7yl/80nkzXe61//pdfZ1m2sb4+zfNut1sUhdaamTudzq1btxAAs0xKqbWOBKKUStO0LAsl5UVZdBWpdUZKSCnTNN3c3Go2MwBIkuTm9hvGLMPr2tra5YN676M9EUKABWNkNJ5kjQYRMoMQFLlSSgGA3nsiIkHOOQRUSp46PRyCZwYiIsKoZV5USsxmxXePHiNikhgA6PcHGxvrzrnpNI+yudls5PksSgljTL8/SIyJWqPdbk2mU+9D1F8kqNtp9wfDuDxmzhoNKeXT477WihDn5EiE0+ms02mVpXXOCREJEZh5c3Oj3WrGPFwtJeYPllHVrNCDAHDiOkWzKGIUL3WO9/AhEOJFUvTUcbrw27m4OnngPNt1tZSIlTofvSjKRweHiICASIQIZVllWcNa55zb2FgritJaJ4QwWg1HYyGlkiKE0Om0i6JUSg6H46yRJmkyGIwEERJqrYUQeT6LARwMRkRERFKKqrKI+Mb2VpY15jN5bvFclkIhhLKshCBmEEJEMytWPJ889+L8+aaqKhIkhWRgrXRMBh8CB5ZSlJUFZimllKKu/akdiGVZAYKSigSFEBBQCBHl9wuKuWdaSCl11QT0ConMOYfIi1KCnbOrkBsWtMZzDQZc0j9zCl89DsYe+LLaKRbhsjt9ufp9MUnDKzsvXp75iuGsTfR9tNOcyFBKdWIlnf6dO1nxOiLKfJHRVGUOiwbWqTt91SkEdW2XtBARYQwrn8YxPgoKIeZR9t7PweGUoOgcUFx5IZ2C+HlfaDorv9hX2oiNttxZOz4+/uyzz7rdbnyQX19fHw6Hk8nk1q1b+/v7EXyUUlrrsiyNMUKIu3fvKqUBVmueRexf6VbMvcdLjIwLYJRJad3/y7ef/+vveFJs3P7BnX/8ex/CaDRSShVFoZRqNBoAMJ1Oo1ceQkjTZDYrjDHee2ttkpheb+11OXPnmVgqQBgdHf/pPz/9q5/8aPsnt33tZ0WptSJBwOzqWhCVlTVGa6Vd7aLmcc6lSSKVrCpblqUUQggRcy96Flor70MIviytVFIKAQDWuTQx8efxxKQoyygEnasbjQQQnXUxzrX3rWa26A9c6EostrKqDg+fKilrH13vsL7eG40miKCUms0KIkqMKcpSCqG1zmczpVRd141GCgzMXJQlIbbb7WmeI4L38XBJN5vZcDjqtFvWudmsTBPTbGZPnh4ppdIkmUzzxGgfQhQvJIStbCNLtzZvPH8B0cdBopU5V9d1FJI0Nx0W+s0FjBCCATiEKJNOlCbRotSJW2udM9/LTLjMVkEhFrTQYwB0tVNSSSmcda72Sslm1hiOxokxRFhVttvtlFVVVVYQaaOj1LHWdrsd7328XOt1K2sbadIfDJVSHBgJi6Lsdjs3t26cgvezE8vzJ5kvrYXmiugUTJ+x7VwqLt5s8TE6CqdYDKvQBi6Bo+9RxMAMUl6khc4ftJw/a1n98PVixha+LPcxc107XLJV6tpezEF87it+HmHxVZIanz9iAgBaUARn7O9VQcYX2NcrkxILQXumhZTSCyqS/z9La2ZwzkY5TfOIxO3v9/vD4TDOvqqqg4MD732e52VZMnM8eY/0VFXV/L0EZi7L0jn3ehaAJ0KTl+W0c+7Ro0cPHz68ffv222+/fXx8/PnnnzebzclkighJkgKw915KWVVVlmUbGxsPHz5khkYj1VoXRfHOO+80m01Y9ZrH0lnqBfW9XNDPBdMzMOqc29/fHw6HaZq+9dZbc8soymbvo3nKUkpf1yQEIpZlyRyU0pGDX9tR52omDiHkeS6llFIqpfJ8dvD4yVqvy8y1P+HgNEkqa4UQzrl2q1lZVxal1pqBOYTKWiJKkwQR+4NR1kiLokgbaQgha6TW1kVZeB96vc5sVngfmINSqqosACglpZAhhMjcgdlo3Ww2RuOJr318HOl225Gv5gs4Y4cQUavVStM0dpJSRh/mxN+NlY0QfHCu5sDMTIiBGQmVlK72RKS1rr1XSmVZAwC0McCQ5zMGAGCtdNZIERARE6OJRJQbhOR9AOCTEypmYHbOWeucdSRofkr1cq5EUZaCBBFpraZ5LkjE1zmUks45HwICElFlrSBqNFJrXdy/aDqcaiWOXF4UpdbaB09IiGCtU1oRfp+zlQu10CKMTvP88eFTKWSSmCQxx8eDNEmss1qrxCRPnh7FZNNKVtZJKVpVNp5MAaCRpmVVMXMILMSJ3Oh220+eHGmt5/Kurut4YL61eSM6cCsZ/SWK+Fq9anAmAsgcvPfnTQ2G5wLfKzpu4Ren4RPlHqPxTAt5765RBFZooetiyy37Qt57uM4NX8NZ9NVG4Le//ffrHYHoW13jCKyvr1/fLELEk1dvr+kCQgjUbDajxXAdZ99sNv8PLrw6JGFvklUAAAAASUVORK5CYII=";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;font-family:'Nunito',sans-serif;color:#1C1C1C;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;}
button,input,select,textarea{font-family:'Nunito',sans-serif;}
::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}

/* ─ TOP NAV ─ */
.tnav{height:50px;flex-shrink:0;display:flex;align-items:center;padding:0 16px;gap:10px;position:sticky;top:0;z-index:100;}
.tnav.dk{background:#0D1117;border-bottom:1px solid rgba(255,255,255,.06);}
.tnav.lt{background:#fff;border-bottom:1px solid #EAECF0;box-shadow:0 1px 3px rgba(0,0,0,.04);}
.tn-gem{width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;}
.tn-brand{font-family:'Nunito',sans-serif;font-size:16px;font-weight:700;}
.tn-brand em{font-style:normal;}
.tn-back{display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:5px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:none;color:rgba(255,255,255,.45);transition:all .1s;white-space:nowrap;}
.tn-back:hover{color:#fff;border-color:rgba(255,255,255,.3);}
.tn-back.lt{border-color:#EAECF0;color:#6B7280;}
.tn-back.lt:hover{border-color:#9CA3AF;color:#2D2D2D;}
.tn-mid{flex:1;min-width:0;}
.tn-title{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tn-title.dk{color:#fff;} .tn-title.lt{color:#1C1C1C;}
.tn-sub{font-size:9px;color:rgba(255,255,255,.25);margin-top:1px;}
.tn-save{font-size:9px;white-space:nowrap;flex-shrink:0;}
.tn-offline{font-size:9px;font-weight:700;background:#F59E0B;color:#1C1C1C;padding:2px 8px;border-radius:10px;flex-shrink:0;}

/* ─ CARD FLOW WRAP ─ */
.assess-wrap{display:flex;flex-direction:column;height:100vh;overflow:hidden;background:#FAFAF8;}
.assess-head{flex-shrink:0;background:#0D1117;}

/* ─ SECTION PROGRESS DOTS ─ */
.sec-dots-bar{background:#0D1117;padding:8px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
.sec-dot-row{display:flex;gap:4px;flex:1;}
.sec-dot-item{height:4px;border-radius:2px;transition:all .3s cubic-bezier(.4,0,.2,1);}
.sec-label-row{font-size:9px;color:rgba(255,255,255,.3);white-space:nowrap;flex-shrink:0;}

/* ─ SECTION TABS (scrollable, compact) ─ */
.stabs{background:#fff;border-bottom:1px solid #EAECF0;display:flex;overflow-x:auto;flex-shrink:0;-webkit-overflow-scrolling:touch;}
.stabs::-webkit-scrollbar{display:none;}
.stab{padding:8px 11px;font-size:10px;font-weight:500;color:#9CA3AF;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;flex-shrink:0;background:none;border-top:none;border-left:none;border-right:none;display:flex;align-items:center;gap:3px;transition:all .1s;}
.stab:hover{color:#2D2D2D;}
.stab.on{color:#1C1C1C;border-bottom-color:#C0392B;font-weight:600;}
.stab.done{color:#059669;border-bottom-color:#059669;}
.stab.miss{color:#DC2626;}
.stab-miss-dot{width:4px;height:4px;border-radius:50%;background:#DC2626;}

/* ─ CARD AREA ─ */
.card-area{flex:1;overflow:hidden;position:relative;}

/* ─ SECTION START CARD ─ */
.sec-start{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;}
.ss-icon{font-size:52px;margin-bottom:18px;animation:popIn .4s cubic-bezier(.34,1.56,.64,1);}
.ss-num{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
.ss-title{font-family:'Nunito',sans-serif;font-size:26px;font-weight:700;color:#1C1C1C;margin-bottom:10px;line-height:1.1;}
.ss-desc{font-size:13px;color:#6B7280;line-height:1.65;max-width:280px;margin-bottom:24px;}
.ss-meta{display:flex;gap:12px;margin-bottom:28px;}
.ss-pill{font-size:10px;font-weight:600;padding:4px 12px;border-radius:20px;background:#FDF3EE;color:#C0392B;border:1px solid #C0392B22;}
.ss-begin{width:100%;max-width:280px;padding:14px;background:#0D1117;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .12s;font-family:'Nunito',sans-serif;}
.ss-begin:hover{background:#1F2937;}

/* ─ QUESTION CARD ─ */
.q-card{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 16px 100px;}
.q-card::-webkit-scrollbar{display:none;}

.qc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.qc-ref{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:500;color:#C0392B;background:#FDF3EE;border:1px solid #C0392B1A;padding:3px 8px;border-radius:5px;}
.qc-dots{display:flex;gap:3px;align-items:center;}
.qc-dot{width:6px;height:6px;border-radius:50%;transition:all .2s;}
.qc-dot.done{background:#C0392B;}
.qc-dot.now{background:#0D1117;transform:scale(1.3);}
.qc-dot.todo{background:#E5E7EB;}
.qc-dot.miss{background:#DC2626;}

.qc-question{font-family:'Nunito',sans-serif;font-size:20px;font-weight:600;color:#1C1C1C;line-height:1.3;margin-bottom:8px;}
.qc-req{color:#DC2626;font-size:13px;}

.qc-guide-btn{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;color:#C0392B;background:#FDF3EE;border:1px solid #C0392B1A;border-radius:20px;padding:3px 10px;cursor:pointer;margin-bottom:16px;}
.qc-guide{padding:10px 12px;background:#FDF3EE;border:1px solid #C0392B14;border-radius:8px;font-size:12px;color:#C0392B;line-height:1.65;margin-bottom:14px;}

/* BIG ANSWER BUTTONS */
.big-ans{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}
.big-btn{width:100%;padding:16px 18px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;border:2px solid #EAECF0;background:#F9FAFB;color:#6B7280;transition:all .15s;text-align:left;display:flex;align-items:center;gap:12px;font-family:'Nunito',sans-serif;}
.big-btn:active{transform:scale(.98);}
.big-btn.y{background:#ECFDF5;border-color:#34D399;color:#7B1C1C;}
.big-btn.n{background:#FEF2F2;border-color:#F87171;color:#991B1B;}
.big-btn.na{background:#F9FAFB;border-color:#D1D5DB;color:#6B7280;}
.big-btn:not(.y):not(.n):not(.na):hover{border-color:#D1D5DB;color:#2D2D2D;}
.big-btn-icon{font-size:20px;flex-shrink:0;}
.big-btn-label{flex:1;}
.big-btn-check{font-size:18px;margin-left:auto;flex-shrink:0;}

/* SELECT / TEXT INPUTS */
.qc-sel{width:100%;background:#F9FAFB;border:2px solid #EAECF0;border-radius:10px;padding:12px 14px;font-size:14px;color:#2D2D2D;outline:none;margin-bottom:14px;cursor:pointer;transition:all .1s;}
.qc-sel:focus{border-color:#C0392B;background:#fff;box-shadow:0 0 0 3px #C0392B0D;}
.qc-inp{width:100%;background:#F9FAFB;border:2px solid #EAECF0;border-radius:10px;padding:12px 14px;font-size:14px;color:#2D2D2D;outline:none;margin-bottom:14px;transition:all .1s;}
.qc-inp:focus{border-color:#C0392B;background:#fff;box-shadow:0 0 0 3px #C0392B0D;}
.qc-inp::placeholder{color:#D1D5DB;}
.mc-wrap{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}
.mc-c{padding:8px 14px;border-radius:20px;font-size:12px;font-weight:500;border:2px solid #EAECF0;background:#F9FAFB;color:#6B7280;cursor:pointer;transition:all .12s;}
.mc-c.on{background:#FDF3EE;border-color:#C0392B;color:#C0392B;font-weight:600;}

/* AUTO-FLAG BANNER */
.autoflag{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:9px;margin-bottom:14px;font-size:12px;color:#92400E;line-height:1.55;}

/* OBS — collapsed */
.obs-row{display:flex;align-items:center;gap:6px;padding:10px 0;cursor:pointer;user-select:none;}
.obs-row-label{font-size:12px;color:#9CA3AF;flex:1;}
.obs-row-label.has{color:#2D2D2D;font-weight:500;}
.obs-box{width:100%;background:#F9FAFB;border:2px solid #EAECF0;border-radius:10px;padding:11px 13px;font-size:13px;color:#2D2D2D;outline:none;resize:none;min-height:80px;line-height:1.6;transition:all .1s;margin-bottom:12px;}
.obs-box:focus{border-color:#C0392B;background:#fff;box-shadow:0 0 0 3px #C0392B0D;}
.obs-box::placeholder{color:#D1D5DB;}

/* PHOTO — camera first */
.photo-strip{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:8px;-webkit-overflow-scrolling:touch;}
.photo-strip::-webkit-scrollbar{display:none;}
.photo-thumb{position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;border:2px solid #EAECF0;flex-shrink:0;}
.photo-thumb img{width:100%;height:100%;object-fit:cover;}
.photo-del{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;border:none;cursor:pointer;font-size:9px;display:flex;align-items:center;justify-content:center;}
.photo-btns{display:flex;gap:7px;margin-bottom:12px;}
.photo-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:9px;font-size:12px;font-weight:600;border:2px solid #EAECF0;background:#F9FAFB;color:#6B7280;cursor:pointer;transition:all .12s;position:relative;overflow:hidden;}
.photo-btn:hover{border-color:#C0392B;color:#C0392B;background:#FDF3EE;}
.photo-btn input{position:absolute;inset:0;opacity:0;cursor:pointer;}
.photo-flash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9999;transition:opacity .1s;}
.photo-cap{width:100%;background:#F9FAFB;border:1px solid #EAECF0;border-radius:7px;padding:6px 10px;font-size:11px;color:#2D2D2D;outline:none;margin-bottom:5px;}
.photo-cap::placeholder{color:#D1D5DB;}
.photo-cap:focus{border-color:#C0392B;}

/* FLAG BUTTON */
.flag-btn{display:flex;align-items:center;gap:8px;width:100%;padding:12px 14px;border-radius:10px;cursor:pointer;border:2px solid #EAECF0;background:#F9FAFB;color:#9CA3AF;font-size:13px;font-weight:500;transition:all .12s;margin-bottom:14px;}
.flag-btn.on{background:#FDF3EE;border-color:#C0392B;color:#C0392B;font-weight:600;}
.flag-btn:hover:not(.on){border-color:#C0392B44;color:#C0392B;}

/* ACTION PANEL */
.act-panel{background:#FDF3EE;border:2px solid #C0392B1A;border-radius:10px;padding:14px;margin-bottom:14px;}
.act-lbl{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C0392B;margin-bottom:10px;}
.act-ta{width:100%;background:#fff;border:1px solid #EAECF0;border-radius:7px;padding:9px 11px;font-size:12px;color:#2D2D2D;outline:none;resize:none;min-height:60px;line-height:1.55;margin-bottom:10px;}
.act-ta::placeholder{color:#D1D5DB;}
.act-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
.act-field{display:flex;flex-direction:column;gap:3px;}
.act-fl{font-size:8px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;}
.act-sel{background:#fff;border:1px solid #EAECF0;border-radius:6px;padding:7px 9px;font-size:11px;color:#2D2D2D;outline:none;width:100%;cursor:pointer;}
.act-inp{background:#fff;border:1px solid #EAECF0;border-radius:6px;padding:7px 9px;font-size:11px;color:#2D2D2D;outline:none;width:100%;}
.act-inp::placeholder{color:#D1D5DB;}
.date-shortcuts{display:flex;gap:5px;flex-wrap:wrap;margin-top:4px;}
.date-sc{font-size:9px;font-weight:600;padding:3px 8px;border-radius:10px;background:#FDF3EE;color:#C0392B;border:1px solid #C0392B22;cursor:pointer;transition:all .1s;}
.date-sc:hover{background:#C0392B;color:#fff;}
.person-suggestions{display:flex;gap:5px;flex-wrap:wrap;margin-top:4px;}
.person-sug{font-size:9px;font-weight:500;padding:3px 8px;border-radius:10px;background:#F3F4F6;color:#6B7280;border:1px solid #EAECF0;cursor:pointer;}
.person-sug:hover{background:#C0392B;color:#fff;border-color:#C0392B;}

/* NEXT BUTTON — sticky at bottom */
.q-footer{position:sticky;bottom:0;left:0;right:0;padding:12px 16px;background:linear-gradient(transparent,#F8F9FC 30%,#F8F9FC);display:flex;gap:8px;align-items:center;}
.q-prev{padding:11px 14px;border-radius:9px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px solid #EAECF0;background:#fff;color:#6B7280;transition:all .1s;flex-shrink:0;}
.q-prev:disabled{opacity:.3;cursor:not-allowed;}
.q-next{flex:1;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;color:#fff;background:#C0392B;transition:all .12s;font-family:'Nunito',sans-serif;}
.q-next:hover{background:#A93226;}
.q-next.dark{background:#0D1117;}
.q-next.dark:hover{background:#1F2937;}
.q-skip{padding:11px 12px;border-radius:9px;font-size:11px;font-weight:500;cursor:pointer;border:1.5px solid #EAECF0;background:#fff;color:#9CA3AF;flex-shrink:0;}

/* SECTION END CARD */
.sec-end{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 24px;text-align:center;}
.se-icon{font-size:48px;margin-bottom:14px;animation:popIn .4s cubic-bezier(.34,1.56,.64,1);}
.se-title{font-family:'Nunito',sans-serif;font-size:24px;font-weight:700;color:#1C1C1C;margin-bottom:6px;}
.se-sub{font-size:12px;color:#6B7280;margin-bottom:20px;line-height:1.6;}
.se-stats{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;justify-content:center;}
.se-stat{padding:8px 16px;border-radius:20px;font-size:11px;font-weight:600;}
.se-next{width:100%;max-width:280px;padding:14px;background:#C0392B;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .12s;font-family:'Nunito',sans-serif;}
.se-next:hover{background:#A93226;}
.se-review{background:none;border:none;font-size:11px;color:#9CA3AF;cursor:pointer;margin-top:12px;text-decoration:underline;}

/* REVIEW MODE */
.review-mode{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;}
.review-q{padding:14px 16px;border-bottom:1px solid #F3F4F6;display:flex;align-items:flex-start;gap:10px;cursor:pointer;transition:background .08s;}
.review-q:hover{background:#FAFAF8;}
.review-q:last-child{border-bottom:none;}
.rq-ref{font-family:'JetBrains Mono',monospace;font-size:8px;color:#9CA3AF;flex-shrink:0;margin-top:3px;width:36px;}
.rq-text{font-size:12px;color:#2D2D2D;flex:1;line-height:1.5;}
.rq-ans{font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;flex-shrink:0;white-space:nowrap;}
.rq-ans.y{background:#ECFDF5;color:#7B1C1C;}
.rq-ans.n{background:#FEF2F2;color:#991B1B;}
.rq-ans.na{background:#F3F4F6;color:#6B7280;}
.rq-ans.flag{background:#FDF3EE;color:#C0392B;}
.rq-ans.miss{background:#FEF2F2;color:#DC2626;}

/* DASHBOARD */
.dash{min-height:100vh;background:#FAFAF8;display:flex;flex-direction:column;}
.dash-scroll{flex:1;overflow-y:auto;}
.dash-body{padding:18px 16px;max-width:900px;margin:0 auto;}
.heatmap{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:12px;}
.hm-cell{border-radius:7px;padding:7px 5px;text-align:center;border:1px solid transparent;cursor:pointer;transition:all .12s;}
.hm-cell:hover{transform:translateY(-1px);box-shadow:0 3px 8px rgba(0,0,0,.07);}
.hm-num{font-size:11px;font-weight:700;margin-bottom:1px;}
.hm-lbl{font-size:7px;font-weight:500;opacity:.7;}
.atile{background:#fff;border:1px solid #EAECF0;border-radius:10px;padding:14px;cursor:pointer;transition:all .12s;margin-bottom:9px;}
.atile:hover{box-shadow:0 3px 14px rgba(0,0,0,.07);}
.atile.complete{border-left:3px solid #059669;}
.atile.draft{border-left:3px solid #C0392B;}
.at-ref{font-family:'JetBrains Mono',monospace;font-size:8px;color:#9CA3AF;margin-bottom:2px;}
.at-name{font-family:'Nunito',sans-serif;font-size:17px;font-weight:700;color:#1C1C1C;margin-bottom:1px;line-height:1.2;}
.at-addr{font-size:10px;color:#9CA3AF;margin-bottom:7px;}
.at-meta{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px;}
.abadge{font-size:9px;font-weight:600;padding:2px 7px;border-radius:10px;}
.at-prog{height:3px;background:#F3F4F6;border-radius:2px;margin-bottom:2px;}
.at-prog-fill{height:100%;border-radius:2px;transition:width .3s;}
.tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.tcrd{background:#fff;border:1px solid #EAECF0;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .15s;}
.tcrd:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(0,0,0,.08);}
.tcrd-top{padding:14px 13px 10px;}
.tcrd-ic{font-size:22px;margin-bottom:9px;}
.tcrd-tag{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}
.tcrd-name{font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:#1C1C1C;margin-bottom:3px;}
.tcrd-desc{font-size:10px;color:#6B7280;line-height:1.5;}
.tcrd-ft{padding:9px 13px;border-top:1px solid #F3F4F6;}
.tcrd-btn{width:100%;padding:7px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid;background:transparent;transition:all .1s;}

/* SETUP FORMS */
.setup-wrap{min-height:100vh;background:#FAFAF8;display:flex;flex-direction:column;}
.form-card{background:#fff;border:1px solid #EAECF0;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.05);}
.fch{padding:16px 18px 0;} .fcb{padding:16px 18px;} .fcf{padding:12px 18px;border-top:1px solid #F3F4F6;display:flex;justify-content:space-between;align-items:center;background:#FAFAF8;}
.fg{display:flex;flex-direction:column;gap:4px;margin-bottom:13px;}
.fg:last-child{margin-bottom:0;}
.fl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#6B7280;}
.fl .req{color:#DC2626;}
.fi,.fs,.ft{background:#F9FAFB;border:1.5px solid #EAECF0;border-radius:8px;padding:9px 12px;color:#1C1C1C;font-size:13px;outline:none;width:100%;transition:all .1s;}
.fi:focus,.fs:focus,.ft:focus{border-color:#C0392B;background:#fff;box-shadow:0 0 0 3px #C0392B0D;}
.fi::placeholder,.ft::placeholder{color:#D1D5DB;}
.ft{min-height:70px;resize:vertical;line-height:1.6;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.span2{grid-column:1/-1;}
.fhint{font-size:9px;color:#9CA3AF;margin-top:2px;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:9px 16px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all .1s;white-space:nowrap;}
.btn-teal{background:#C0392B;color:#fff;} .btn-teal:hover{background:#A93226;}
.btn-dark{background:#0D1117;color:#fff;} .btn-dark:hover{background:#1F2937;}
.btn-ghost{background:transparent;color:#2D2D2D;border:1px solid #EAECF0;} .btn-ghost:hover{border-color:#9CA3AF;}
.btn-sm{padding:6px 11px;font-size:11px;} .btn-full{width:100%;}

/* CARDS */
.card{background:#fff;border:1px solid #EAECF0;border-radius:10px;overflow:hidden;}
.ch{padding:12px 16px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;justify-content:space-between;}
.ct{font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;}
.cb{padding:14px 16px;}

/* COMPLETE SCREEN */
.complete-wrap{min-height:100vh;background:#FAFAF8;overflow-y:auto;}
.tab-nav{display:flex;gap:3px;padding:10px 14px;background:#fff;border-bottom:1px solid #EAECF0;position:sticky;top:50px;z-index:50;}
.tnb{flex:1;padding:8px 4px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:500;transition:all .1s;text-align:center;}

/* REPORT */
.rpt-wrap{background:#CBD5E1;padding:12px;}
.rpt-page{background:#fff;border-radius:2px;box-shadow:0 2px 12px rgba(0,0,0,.1);overflow:hidden;margin-bottom:14px;}
.rpt-body{padding:18px 16px;}
.rpt-sh{display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:7px;border-bottom:2px solid #EAECF0;}
.rpt-sn{font-family:'Nunito',sans-serif;font-size:22px;font-weight:700;color:#EAECF0;line-height:1;flex-shrink:0;}
.rpt-st{font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#1C1C1C;}
.rpt-sl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:1px;}
.rpt-p{font-size:10px;line-height:1.75;color:#4B5563;margin-bottom:10px;}
.rpt-tbl{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:12px;}
.rpt-tbl th{padding:6px 8px;text-align:left;font-size:7px;font-weight:700;text-transform:uppercase;color:#fff;}
.rpt-tbl td{padding:7px 8px;border-bottom:1px solid #F3F4F6;line-height:1.5;vertical-align:top;}
.rpt-tbl tr:nth-child(even) td{background:#F9FAFB;}
.rpt-finding{padding:9px 0;border-bottom:1px solid #F3F4F6;}
.rpt-finding:last-child{border-bottom:none;}
.rpt-f-head{display:flex;align-items:flex-start;gap:7px;margin-bottom:5px;}
.rpt-f-ref{font-family:'JetBrains Mono',monospace;font-size:8px;color:#9CA3AF;flex-shrink:0;margin-top:2px;}
.rpt-f-text{font-size:10px;color:#2D2D2D;line-height:1.5;flex:1;}
.rpt-f-pri{font-size:8px;font-weight:700;padding:1px 6px;border-radius:8px;flex-shrink:0;}
.rpt-f-photos{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px;margin-left:22px;}
.rpt-f-photo img{width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #EAECF0;}
.rpt-f-caption{font-size:7px;color:#9CA3AF;text-align:center;max-width:60px;margin-top:1px;line-height:1.3;}
.app-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.app-item img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:5px;border:1px solid #EAECF0;}
.app-ref{font-family:'JetBrains Mono',monospace;font-size:7px;color:#9CA3AF;margin-top:2px;}
.app-cap{font-size:8px;color:#2D2D2D;line-height:1.4;}
.sig-card{border:1px solid #EAECF0;border-radius:6px;overflow:hidden;margin-bottom:10px;}
.sig-head{background:#F9FAFB;padding:6px 12px;font-size:7px;font-weight:700;text-transform:uppercase;color:#9CA3AF;border-bottom:1px solid #EAECF0;}
.sig-body{padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.sig-f{display:flex;flex-direction:column;gap:2px;}
.sig-l{font-size:7px;font-weight:700;text-transform:uppercase;color:#9CA3AF;}
.sig-v{font-size:11px;font-weight:600;padding-bottom:3px;border-bottom:1.5px solid #0D1117;}
.sig-c{border:1px dashed #D1D5DB;border-radius:3px;height:34px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:9px;font-style:italic;}

/* ACTION TRACKER */
.act-item{padding:12px 0;border-bottom:1px solid #F3F4F6;display:flex;gap:9px;align-items:flex-start;}
.act-item:last-child{border-bottom:none;}
.act-pdot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.act-body{flex:1;min-width:0;}
.act-text{font-size:12px;font-weight:500;color:#1C1C1C;line-height:1.5;margin-bottom:4px;}
.act-tags{display:flex;gap:5px;flex-wrap:wrap;}
.act-tag{font-size:8px;font-weight:600;padding:2px 7px;border-radius:8px;background:#F3F4F6;color:#6B7280;font-family:'JetBrains Mono',monospace;}
.act-ssel{font-size:10px;background:#F9FAFB;border:1px solid #EAECF0;border-radius:5px;padding:3px 7px;color:#2D2D2D;outline:none;cursor:pointer;flex-shrink:0;}

/* MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.modal{background:#fff;border-radius:14px 14px 0 0;width:100%;max-width:580px;overflow:hidden;}
.modal-h{padding:16px 18px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;justify-content:space-between;}
.modal-t{font-family:'Nunito',sans-serif;font-size:17px;font-weight:700;}
.modal-x{background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer;}
.modal-b{padding:16px 18px;} .modal-f{padding:12px 18px;border-top:1px solid #F3F4F6;display:flex;gap:8px;justify-content:flex-end;}

/* LANDING */
.land{min-height:100vh;background:#FAFAF8;overflow-y:auto;}
.land-nav{background:rgba(248,249,252,.96);backdrop-filter:blur(16px);border-bottom:1px solid #EAECF0;padding:0 16px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
.hero{padding:44px 16px 36px;max-width:640px;margin:0 auto;}
.hero-ey{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#C0392B;display:flex;align-items:center;gap:7px;margin-bottom:10px;}
.hero-ey::before{content:'';width:14px;height:1px;background:#C0392B;}
.hero-h1{font-family:'Nunito',sans-serif;font-size:clamp(32px,8vw,50px);font-weight:700;line-height:1.07;color:#1C1C1C;margin-bottom:12px;}
.hero-h1 em{font-style:italic;color:#C0392B;}
.hero-p{font-size:13px;color:#6B7280;line-height:1.7;max-width:420px;margin-bottom:22px;}
.hero-btns{display:flex;gap:8px;flex-wrap:wrap;}
.trust{background:#fff;border-top:1px solid #EAECF0;border-bottom:1px solid #EAECF0;padding:10px 16px;display:flex;gap:0;overflow-x:auto;}
.trust::-webkit-scrollbar{display:none;}
.ti{display:flex;align-items:center;gap:4px;padding:0 12px;border-right:1px solid #F3F4F6;font-size:8px;font-weight:600;color:#C0392B;white-space:nowrap;flex-shrink:0;}
.ti:last-child{border-right:none;}

/* LOGO / COLOUR */
.logo-drop{border:2px dashed #D1D5DB;border-radius:8px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;min-height:80px;background:#F9FAFB;text-align:center;transition:all .12s;}
.logo-drop:hover{border-color:#C0392B;background:#FDF3EE;}
.logo-drop img{max-width:110px;max-height:50px;object-fit:contain;}
.swatches{display:flex;flex-wrap:wrap;gap:5px;}
.sw{width:24px;height:24px;border-radius:5px;cursor:pointer;border:2px solid transparent;transition:all .1s;flex-shrink:0;}
.sw.on{border-color:#1C1C1C;transform:scale(1.1);}
.sw-pick{display:flex;align-items:center;justify-content:center;font-size:13px;color:#9CA3AF;border:1.5px dashed #D1D5DB;background:#F9FAFB;position:relative;overflow:hidden;}
.sw-pick input{position:absolute;inset:0;opacity:0;cursor:pointer;}

/* ANIMATIONS */
.fade{animation:fu .15s ease both;}
@keyframes fu{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
.slide-in{animation:si .2s ease both;}
@keyframes si{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
.slide-out{animation:so .15s ease both;}
@keyframes so{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-24px)}}
.pop{animation:po .35s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes po{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes popIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}

@media(max-width:540px){
  .g2{grid-template-columns:1fr;}
  .act-grid{grid-template-columns:1fr;}
  .heatmap{grid-template-columns:repeat(3,1fr);}
}
`;

// ─── LOGO DROP ────────────────────────────────────────────────────
function LogoDrop({logo, onLogo}) {
  const ref = useRef();
  const handle = f => {
    if (!f?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => onLogo(e.target.result);
    r.readAsDataURL(f);
  };
  return (
    <div className="logo-drop" onClick={()=>ref.current.click()}
      onDragOver={e=>e.preventDefault()}
      onDrop={e=>{e.preventDefault();handle(e.dataTransfer.files[0]);}}>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files[0])}/>
      {logo ? <><img src={logo} alt="logo"/><span style={{fontSize:9,color:"#9CA3AF"}}>Tap to change</span></> :
        <><span style={{fontSize:20}}>🖼️</span><span style={{fontSize:11,fontWeight:600,color:"#2D2D2D"}}>Drop or tap to upload</span><span style={{fontSize:9,color:"#9CA3AF"}}>PNG, SVG or JPG</span></>}
    </div>
  );
}

// ─── COLOUR PICKER ────────────────────────────────────────────────
const SW_COLOURS = ["#1C1C1C","#8B1A1A","#C0392B","#E05A1A","#7B1C1C","#1D4ED8","#9333EA","#B45309","#0369A1","#374151"];
function ColourPicker({value, onChange}) {
  return (
    <div className="swatches">
      {SW_COLOURS.map(c=>(
        <div key={c} className={`sw ${value===c?"on":""}`} style={{background:c}} onClick={()=>onChange(c)}/>
      ))}
      <div className="sw sw-pick" style={{width:24,height:24,borderRadius:5}}>
        🎨<input type="color" value={value||"#0D1117"} onChange={e=>onChange(e.target.value)}/>
      </div>
    </div>
  );
}

// ─── QUESTION CARD (single-question card-by-card flow) ────────────
function QuestionCard({q, qIdx, totalVisible, state={}, onChange, onNext, onPrev, showMissed, sectionId, recentPersons=[], onRememberPerson}) {
  const {ans=null, note="", flagged=false, sel=[], photos=[],
         action="", priority="P3 - Within 3 months",
         responsible="", targetDate="", actionStatus="pending"} = state;

  const [showNote,  setShowNote]  = useState(!!note);
  const [showGuide, setShowGuide] = useState(false);
  const [flash,     setFlash]     = useState(false);
  const [photosArr, setPhotosArr] = useState(photos);

  // Keep local photos in sync
  useEffect(()=>{ setPhotosArr(photos); }, []);

  const upd = patch => onChange({
    ...state, ans, note, flagged, sel,
    photos:photosArr, action, priority,
    responsible, targetDate, actionStatus, ...patch
  });

  const updPhotos = fn => {
    const next = typeof fn==="function" ? fn(photosArr) : fn;
    setPhotosArr(next);
    upd({photos:next});
  };

  const handleFiles = files => {
    // Flash effect for camera capture feedback
    setFlash(true);
    setTimeout(()=>setFlash(false), 150);
    Array.from(files).forEach(f => {
      if (!f?.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = e => {
        const words = q.q.split(" ").slice(0,5).join(" ");
        updPhotos(prev=>[...prev,{id:Date.now()+Math.random(),src:e.target.result,caption:words+"…"}]);
      };
      r.readAsDataURL(f);
    });
  };

  const toggleSel = o => upd({sel:sel.includes(o)?sel.filter(x=>x!==o):[...sel,o]});

  // Smart No
  const handleAns = v => {
    const newAns = ans===v ? null : v;
    if (newAns==="n" && SMART_ACTIONS[q.ref]) {
      upd({ans:newAns, flagged:true,
        action: action||SMART_ACTIONS[q.ref].action,
        priority: SMART_ACTIONS[q.ref].priority});
    } else {
      upd({ans:newAns});
    }
  };

  const isAns  = isAnswered(q, state);
  const missed = showMissed && isMissed(q, state);
  const defPri = SMART_ACTIONS[q.ref]?.priority || SECTION_PRIORITY[sectionId] || "P3 — Within 3 months";

  const handleFlag = () => {
    const newFlag = !flagged;
    upd({flagged:newFlag, priority:priority||defPri});
  };

  const saveResponsible = name => {
    if (name && name.trim()) onRememberPerson(name.trim());
  };

  const camRef  = useRef();
  const fileRef = useRef();

  return (
    <>
      {/* Photo flash */}
      {flash && <div className="photo-flash" style={{opacity:.8}}/>}

      <div className="q-card slide-in" key={q.ref}>
        {/* Header: ref + progress dots */}
        <div className="qc-header">
          <span className="qc-ref">{q.ref}</span>
          <div className="qc-dots">
            {Array.from({length:Math.min(totalVisible,9)}).map((_,i)=>{
              const cls = i<qIdx?"done":i===qIdx?"now":"todo";
              return <div key={i} className={`qc-dot ${cls}`}/>;
            })}
            {totalVisible>9 && <span style={{fontSize:9,color:"#9CA3AF",marginLeft:2}}>+{totalVisible-9}</span>}
          </div>
        </div>

        {/* Question text */}
        <div className="qc-question">
          {q.q}{q.required&&<span className="qc-req"> *</span>}
        </div>

        {/* Guidance */}
        {q.g && (
          <>
            <button className="qc-guide-btn" onClick={()=>setShowGuide(s=>!s)}>
              {showGuide?"▴":"▾"} What to check
            </button>
            {showGuide && <div className="qc-guide">{q.g}</div>}
          </>
        )}

        {/* ANSWERS */}
        {(q.t==="yn"||q.t==="ynna") && (
          <div className="big-ans">
            {[{v:"y",icon:"✓",label:"Yes"},{v:"n",icon:"✗",label:"No"},...(q.t==="ynna"?[{v:"na",icon:"—",label:"Not applicable"}]:[])].map(opt=>(
              <button key={opt.v} className={`big-btn ${ans===opt.v?opt.v:""}`}
                onClick={()=>handleAns(opt.v)}>
                <span className="big-btn-icon">{opt.icon}</span>
                <span className="big-btn-label">{opt.label}</span>
                {ans===opt.v && <span className="big-btn-check">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Auto-flag banner */}
        {ans==="n" && SMART_ACTIONS[q.ref] && !flagged && (
          <div className="autoflag">
            <span style={{fontSize:15,flexShrink:0}}>⚑</span>
            <div><strong>Action suggested</strong> — this finding has been flagged automatically with a pre-written action. Review below.</div>
          </div>
        )}

        {q.t==="select" && (
          <select className="qc-sel" value={ans||""} onChange={e=>upd({ans:e.target.value||null})}>
            <option value="">Select…</option>
            {q.opts.map(o=><option key={o}>{o}</option>)}
          </select>
        )}
        {q.t==="text" && (
          <input className="qc-inp" placeholder="Enter details..." value={ans||""}
            onChange={e=>upd({ans:e.target.value||null})}/>
        )}
        {q.t==="multi" && (
          <div className="mc-wrap">
            {q.opts.map(o=>(
              <span key={o} className={`mc-c ${sel.includes(o)?"on":""}`} onClick={()=>toggleSel(o)}>{o}</span>
            ))}
          </div>
        )}

        {/* Observation — collapsed by default */}
        <div className={`obs-row ${note?"has":""}`} onClick={()=>setShowNote(s=>!s)}>
          <span style={{fontSize:12,color:"#9CA3AF"}}>{showNote?"▴":"▾"}</span>
          <span className={`obs-row-label ${note?"has":""}`}>
            {note?"Observation added — tap to edit":"Add observation (optional)"}
          </span>
        </div>
        {showNote && (
          <textarea className="obs-box" placeholder="Assessor observations..."
            value={note} onChange={e=>upd({note:e.target.value})} autoFocus={!note}/>
        )}

        {/* Photos */}
        {photosArr.length>0 && (
          <div className="photo-strip">
            {photosArr.map((p,i)=>(
              <div key={p.id} className="photo-thumb">
                <img src={p.src} alt={p.caption}/>
                <button className="photo-del" onClick={()=>updPhotos(photosArr.filter(x=>x.id!==p.id))}>&#10005;</button>
              </div>
            ))}
          </div>
        )}
        {photosArr.map(p=>(
          <input key={p.id} className="photo-cap" placeholder="Caption..."
            value={p.caption} onChange={e=>updPhotos(photosArr.map(x=>x.id===p.id?{...x,caption:e.target.value}:x))}/>
        ))}
        <div className="photo-btns">
          <div className="photo-btn">
            <input ref={camRef} type="file" accept="image/*" capture="environment"
              onChange={e=>handleFiles(e.target.files)}/>
            📷 Camera
          </div>
          <div className="photo-btn">
            <input ref={fileRef} type="file" accept="image/*" multiple
              onChange={e=>handleFiles(e.target.files)}/>
            🖼 Library
          </div>
        </div>

        {/* Flag */}
        <button className={`flag-btn ${flagged?"on":""}`} onClick={handleFlag}>
          <span>{flagged?"🚩":"⚑"}</span>
          <span style={{flex:1}}>{flagged?"Flagged for Action Plan":"Flag for Action Plan"}</span>
          {photosArr.length>0 && <span style={{fontSize:10,color:"#9CA3AF"}}>📷{photosArr.length}</span>}
        </button>

        {/* Action panel */}
        {flagged && (
          <div className="act-panel">
            <div className="act-lbl">Action Plan Entry</div>
            <textarea className="act-ta" placeholder="Describe the action required..."
              value={action} onChange={e=>upd({action:e.target.value})}/>
            <div className="act-grid">
              <div className="act-field">
                <div className="act-fl">Priority</div>
                <select className="act-sel" value={priority} onChange={e=>upd({priority:e.target.value})}>
                  <option>P1 — Immediate</option>
                  <option>P2 — Within 1 month</option>
                  <option>P3 — Within 3 months</option>
                  <option>P4 — Within 12 months</option>
                </select>
              </div>
              <div className="act-field">
                <div className="act-fl">Responsible Person</div>
                <input className="act-inp" placeholder="Name or role"
                  value={responsible}
                  onChange={e=>upd({responsible:e.target.value})}
                  onBlur={e=>saveResponsible(e.target.value)}/>
                {recentPersons.length>0 && (
                  <div className="person-suggestions">
                    {recentPersons.map(p=>(
                      <span key={p} className="person-sug" onClick={()=>upd({responsible:p})}>{p}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="act-field">
                <div className="act-fl">Target Date</div>
                <input type="date" className="act-inp" value={targetDate} onChange={e=>upd({targetDate:e.target.value})}/>
                <div className="date-shortcuts">
                  {[[7,"1 wk"],[30,"1 mo"],[90,"3 mo"],[365,"1 yr"]].map(([d,l])=>(
                    <span key={d} className="date-sc" onClick={()=>upd({targetDate:addDays(d)})}>{l}</span>
                  ))}
                </div>
              </div>
              <div className="act-field">
                <div className="act-fl">Status</div>
                <select className="act-sel" value={actionStatus} onChange={e=>upd({actionStatus:e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="complete">Complete ✓</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {missed && (
          <div style={{padding:"9px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:11,color:"#DC2626",fontWeight:500}}>
            ⚠ This question is required. Please provide an answer before completing the assessment.
          </div>
        )}
      </div>
    </>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────
function Landing({dispatch}) {
  return (
    <div className="land">
      <nav className="land-nav">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="tn-gem" style={{background:"#fff",padding:0,overflow:"hidden"}}><img src={_IMG0} style={{width:"100%",height:"100%",objectFit:"contain",display:"block",padding:"1px"}}/></div>
          <span style={{fontFamily:"'Nunito',sans-serif",fontSize:18,fontWeight:800,color:"#1C1C1C",letterSpacing:"-.3px"}}>Fire<em style={{color:"#C0392B",fontStyle:"normal"}}>site</em></span><span style={{fontSize:10,color:"#9CA3AF",marginLeft:4,fontFamily:"'Nunito',sans-serif",fontWeight:600}}>by Bluejai</span>
        </div>
        <button className="btn btn-teal btn-sm" onClick={()=>dispatch({type:"GO",screen:"setup"})}>Get Started</button>
      </nav>
      <div className="hero">
        <div className="hero-ey">Trusted by UK fire risk assessors</div>
        <h1 className="hero-h1">The FRA platform<br/><em>trusted by industry professionals.</em></h1>
        <p className="hero-p">Every hour you spend typing up notes after a site visit is an hour you're not billing. Firesite captures everything on site — questions, photos, actions — and generates your complete branded report before you leave the building.</p>
        <div className="hero-btns">
          <button className="btn btn-teal" style={{padding:"11px 22px",fontSize:13}} onClick={()=>dispatch({type:"GO",screen:"setup"})}>Set up your platform</button>
          <button className="btn btn-ghost" style={{padding:"11px 22px",fontSize:13}} onClick={()=>dispatch({type:"GO",screen:"dashboard"})}>Skip to demo</button>
        </div>
      </div>
      <div className="trust">
        {["RRO 2005","Fire Safety Act 2021","BS 5839","BS 5266","BS 8214","BS 9999","DSEAR 2002"].map(l=>(
          <div key={l} className="ti"><span>✓</span>{l}</div>
        ))}
      </div>
      <div style={{background:"#1C1C1C",padding:"44px 16px 48px"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>

          {/* Label */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{height:1,flex:1,background:"rgba(255,255,255,.08)"}}/>
            <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"2.5px",color:"#C0392B"}}>Built for the site visit</span>
            <div style={{height:1,flex:1,background:"rgba(255,255,255,.08)"}}/>
          </div>

          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:24,fontWeight:800,color:"#fff",marginBottom:6,lineHeight:1.08,letterSpacing:"-.3px"}}>
            Built for the assessor.<br/><span style={{color:"#C0392B"}}>Not the desk.</span>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.38)",marginBottom:32,lineHeight:1.65,maxWidth:480}}>
            Every feature was designed for one moment — standing in a building with a phone, doing the job.
          </div>

          {/* Feature grid — 2x2 cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {n:"01",ic:"📋",t:"One question. Full screen.",d:"One question fills the screen. Big tap targets. No scrolling through a long form.",col:"#C0392B",light:"#3D0B0B"},
              {n:"02",ic:"📷",t:"Evidence captured. Instantly filed.",d:"One tap opens your camera. Photos attach to the finding and appear in the report appendix.",col:"#E05A1A",light:"#3D1A0A"},
              {n:"03",ic:"⚑",t:"Smart No",d:"Answer No on a critical question and the remediation action is pre-written for you.",col:"#C0392B",light:"#3D0B0B"},
              {n:"04",ic:"📄",t:"Professional reports",d:"7-page branded PDF. Cover, findings, photos, action plan, declaration. Done on site.",col:"#E05A1A",light:"#3D1A0A"},
            ].map((f,i)=>(
              <div key={f.n} style={{
                background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(255,255,255,.07)",
                borderRadius:12,
                padding:"18px 16px",
                display:"flex",
                flexDirection:"column",
                gap:12,
                position:"relative",
                overflow:"hidden",
              }}>
                {/* Coloured top rule */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${f.col},transparent)`}}/>
                {/* Number + icon row */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:500,color:"rgba(255,255,255,.18)",letterSpacing:"1px"}}>{f.n}</span>
                  <div style={{
                    width:36,height:36,borderRadius:9,
                    background:f.light,
                    border:`1px solid ${f.col}55`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,
                  }}>{f.ic}</div>
                </div>
                {/* Text */}
                <div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,color:"#fff",marginBottom:5,lineHeight:1.2}}>{f.t}</div>
                  <div style={{fontSize:11.5,color:"rgba(255,255,255,.4)",lineHeight:1.6}}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stat strip */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,marginTop:24,borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,.07)"}}>
            {[["163","Questions covered"],["12","Assessment sections"],["7","Page PDF report"]].map(([v,l],i)=>(
              <div key={l} style={{
                padding:"14px 10px",textAlign:"center",
                borderRight:i<2?"1px solid rgba(255,255,255,.07)":"none",
              }}>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:26,fontWeight:900,color:"#C0392B",lineHeight:1}}>{v}</div>
                <div style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:"rgba(255,255,255,.3)",marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────
function Setup({state, dispatch}) {
  const step = state.setupStep||0;
  const org  = state.org;
  const upd  = p => dispatch({type:"SET_ORG",p});
  const ac   = org.accentColor||"#0D7A7A";
  const pr   = org.primaryColor||"#0D1117";
  const STEPS = [
    {title:"Your Details",     icon:"🏢",sub:"Your name or trading name and contact details — appears on every report you produce."},
    {title:"Assessor Details", icon:"👤",sub:"Your qualifications and professional details for the report declaration page."},
    {title:"Brand & Identity", icon:"🎨",sub:"Your logo and colours. Every report will carry your identity."},
    {title:"Report Settings",  icon:"📄",sub:"Report footer, disclaimer and reference format."},
  ];
  const SW = ["#1C1C1C","#8B1A1A","#C0392B","#E05A1A","#F07830","#7B1C1C","#1D4ED8","#9333EA","#B45309","#374151"];

  const pages = [
    <div key="s0" className="g2">
      <div className="fg span2"><label className="fl">Your name or trading name <span className="req">*</span></label>
        <input className="fi" placeholder="e.g. James Hartley Fire Safety" value={org.name||""} onChange={e=>upd({name:e.target.value})}/></div>
      <div className="fg span2"><label className="fl">Address</label>
        <textarea className="ft" style={{minHeight:58}} placeholder="Full business address" value={org.address||""} onChange={e=>upd({address:e.target.value})}/></div>
      <div className="fg"><label className="fl">Email</label>
        <input className="fi" type="email" placeholder="info@yourcompany.co.uk" value={org.email||""} onChange={e=>upd({email:e.target.value})}/></div>
      <div className="fg"><label className="fl">Phone</label>
        <input className="fi" type="tel" placeholder="01234 567890" value={org.phone||""} onChange={e=>upd({phone:e.target.value})}/></div>
    </div>,
    <div key="s1" className="g2">
      <div className="fg span2"><label className="fl">Assessor full name <span className="req">*</span></label>
        <input className="fi" placeholder="e.g. James Hartley" value={org.assessor||""} onChange={e=>upd({assessor:e.target.value})}/></div>
      <div className="fg"><label className="fl">Job title</label>
        <input className="fi" placeholder="e.g. Fire Risk Assessor" value={org.jobTitle||""} onChange={e=>upd({jobTitle:e.target.value})}/></div>
      <div className="fg"><label className="fl">Qualifications</label>
        <input className="fi" placeholder="e.g. MIFPO, MIFSM" value={org.quals||""} onChange={e=>upd({quals:e.target.value})}/></div>
      <div className="fg"><label className="fl">Assessor email</label>
        <input className="fi" type="email" value={org.assessorEmail||""} onChange={e=>upd({assessorEmail:e.target.value})}/></div>
      <div className="fg"><label className="fl">Assessor phone</label>
        <input className="fi" type="tel" value={org.assessorPhone||""} onChange={e=>upd({assessorPhone:e.target.value})}/></div>
    </div>,
    <div key="s2">
      <div className="fg" style={{marginBottom:16}}><label className="fl">Company logo</label>
        <LogoDrop logo={org.logo} onLogo={v=>upd({logo:v})}/></div>
      <div className="g2" style={{marginBottom:16}}>
        <div className="fg"><label className="fl">Primary colour</label>
          <div style={{fontSize:9,color:"#9CA3AF",marginBottom:5}}>Header, nav, buttons</div>
          <ColourPicker value={org.primaryColor||"#0D1117"} onChange={v=>upd({primaryColor:v})}/></div>
        <div className="fg"><label className="fl">Accent colour</label>
          <div style={{fontSize:9,color:"#9CA3AF",marginBottom:5}}>Highlights, markers</div>
          <ColourPicker value={org.accentColor||"#0D7A7A"} onChange={v=>upd({accentColor:v})}/></div>
      </div>
      <label className="fl" style={{display:"block",marginBottom:8}}>Live cover preview</label>
      <div style={{borderRadius:9,overflow:"hidden",border:"1px solid #EAECF0",boxShadow:"0 3px 14px rgba(0,0,0,.07)"}}>
        <div style={{background:pr,padding:"16px 14px 12px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:-20,right:-20,width:90,height:90,borderRadius:"50%",border:"14px solid rgba(255,255,255,.05)"}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,position:"relative"}}>
            {org.logo?<img src={org.logo} style={{height:26,objectFit:"contain",borderRadius:3}} alt=""/>:
              <div style={{width:26,height:26,borderRadius:5,background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}><img src={_IMG0} style={{width:"100%",height:"100%",objectFit:"contain",display:"block",padding:"1px"}}/></div>}
            <div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#fff"}}>{org.name||"Your Organisation"}</div>
              {org.assessor&&<div style={{fontSize:8,color:"rgba(255,255,255,.4)",marginTop:1}}>{org.assessor}{org.quals?` · ${org.quals}`:""}</div>}
            </div>
          </div>
          <div style={{width:26,height:2,background:ac,marginBottom:8,position:"relative"}}/>
          <div style={{fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:ac,marginBottom:5,position:"relative"}}>Fire Risk Assessment</div>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700,color:"#fff",lineHeight:1.15,position:"relative"}}>Crown House<br/><span style={{fontSize:12,opacity:.55}}>London EC2V</span></div>
        </div>
        <div style={{height:2,background:`linear-gradient(90deg,${ac},transparent)`}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",background:"#fff"}}>
          {[["Reference","FRA-2026-001"],["Risk Rating","MEDIUM"]].map(([l,v])=>(
            <div key={l} style={{padding:"7px 11px",borderRight:"1px solid #F3F4F6",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{fontSize:6,fontWeight:700,textTransform:"uppercase",color:"#9CA3AF",marginBottom:1}}>{l}</div>
              <div style={{fontSize:10,fontWeight:600,color:v==="MEDIUM"?"#D97706":"#0D1117"}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    <div key="s3">
      <div className="fg"><label className="fl">Report reference prefix</label>
        <input className="fi" placeholder="FRA" value={org.refPrefix||""} onChange={e=>upd({refPrefix:e.target.value})}/>
        <div className="fhint">e.g. {org.refPrefix||"FRA"}-2026-001</div></div>
      <div className="fg"><label className="fl">Assessment type</label>
        <select className="fs" value={org.assessType||"Type 1 — Non-Intrusive"} onChange={e=>upd({assessType:e.target.value})}>
          {["Type 1 — Non-Intrusive","Type 2 — Intrusive (non-destructive)","Type 3 — Intrusive (destructive)","Type 4 — Enhanced"].map(t=><option key={t}>{t}</option>)}
        </select></div>
      <div className="fg"><label className="fl">Report footer</label>
        <textarea className="ft" placeholder="This report is confidential..." value={org.reportFooter||""} onChange={e=>upd({reportFooter:e.target.value})}/></div>
      <div className="fg"><label className="fl">Disclaimer</label>
        <textarea className="ft" placeholder="This fire risk assessment has been carried out by a competent person..." value={org.disclaimer||""} onChange={e=>upd({disclaimer:e.target.value})}/></div>
    </div>,
  ];

  return (
    <div className="setup-wrap">
      <div style={{background:pr,padding:"0 16px",height:46,display:"flex",alignItems:"center",gap:9,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div className="tn-gem" style={{background:"#fff",padding:0,overflow:"hidden"}}><img src={_IMG0} style={{width:"100%",height:"100%",objectFit:"contain",display:"block",padding:"1px"}}/></div>
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-.3px"}}>Fire<em style={{color:ac,fontStyle:"normal"}}>site</em> — Setup</span>
        <div style={{marginLeft:"auto",display:"flex",gap:4}}>
          {STEPS.map((_,i)=><div key={i} style={{height:4,width:i===step?14:4,borderRadius:2,background:i<=step?ac:"rgba(255,255,255,.12)",transition:"all .25s"}}/>)}
        </div>
      </div>
      <div style={{height:3}}><div style={{height:"100%",width:`${((step+1)/STEPS.length)*100}%`,background:ac,transition:"width .4s cubic-bezier(.4,0,.2,1)"}}/></div>
      <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px 60px",overflowY:"auto"}}>
        <div className="form-card fade" key={step} style={{maxWidth:520,width:"100%"}}>
          <div className="fch">
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
              <div style={{width:30,height:30,borderRadius:6,background:"#FDF3EE",border:"1px solid #C0392B14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{STEPS[step].icon}</div>
              <div>
                <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:ac,marginBottom:1}}>Step {step+1} of {STEPS.length}</div>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:19,fontWeight:700,color:"#1C1C1C"}}>{STEPS[step].title}</div>
              </div>
            </div>
            <p style={{fontSize:12,color:"#6B7280",lineHeight:1.6,paddingBottom:14,borderBottom:"1px solid #F3F4F6"}}>{STEPS[step].sub}</p>
          </div>
          <div className="fcb">{pages[step]}</div>
          <div className="fcf">
            {step>0?<button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"SETUP_STEP",i:step-1})}>← Back</button>:
              <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"GO",screen:"landing"})}>← Home</button>}
            <div style={{display:"flex",gap:4}}>
              {STEPS.map((_,i)=><div key={i} style={{height:4,width:i===step?12:4,borderRadius:2,background:i<=step?ac:"#EAECF0",transition:"all .25s"}}/>)}
            </div>
            {step<STEPS.length-1
              ?<button className="btn btn-teal btn-sm" onClick={()=>dispatch({type:"SETUP_STEP",i:step+1})}>Continue -></button>
              :<button className="btn btn-teal btn-sm" onClick={()=>dispatch({type:"FINISH_SETUP"})}>Launch -></button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT SETUP ─────────────────────────────────────────────────
function ClientSetup({state, dispatch}) {
  const a   = state.assessments.find(x=>x.id===state.activeId)||{};
  const upd = p => dispatch({type:"UPDATE_ASSESSMENT",patch:p});
  const ac  = state.org.accentColor||"#0D7A7A";
  const pr  = state.org.primaryColor||"#0D1117";
  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8",display:"flex",flexDirection:"column"}}>
      <div className="tnav dk" style={{background:pr}}>
        <button className="tn-back" onClick={()=>dispatch({type:"GO",screen:"dashboard"})}>← Back</button>
        <div className="tn-mid"><div className="tn-title dk" style={{fontSize:12}}>New Assessment</div></div>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)"}}>{a.ref}</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"22px 16px 60px"}}>
        <div style={{maxWidth:520,margin:"0 auto"}}>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:ac,marginBottom:5}}>Before you begin</div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:22,fontWeight:700,color:"#1C1C1C",marginBottom:4,lineHeight:1.1}}>Client & Premises</div>
            <div style={{fontSize:12,color:"#6B7280",lineHeight:1.6}}>These details populate your report cover and header. You can edit them later.</div>
          </div>
          <div className="form-card">
            <div className="fcb">
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,marginBottom:11,paddingBottom:9,borderBottom:"1px solid #F3F4F6"}}>Client</div>
              <div className="g2">
                <div className="fg span2"><label className="fl">Client name <span className="req">*</span></label>
                  <input className="fi" placeholder="e.g. Meridian Property Group" value={a.clientName||""} onChange={e=>upd({clientName:e.target.value})}/></div>
                <div className="fg"><label className="fl">Contact name</label>
                  <input className="fi" placeholder="David Marsh" value={a.clientContact||""} onChange={e=>upd({clientContact:e.target.value})}/></div>
                <div className="fg"><label className="fl">Contact email</label>
                  <input className="fi" type="email" value={a.clientEmail||""} onChange={e=>upd({clientEmail:e.target.value})}/></div>
              </div>
              <div style={{height:1,background:"#F3F4F6",margin:"12px 0"}}/>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,marginBottom:11,paddingBottom:9,borderBottom:"1px solid #F3F4F6"}}>Premises</div>
              <div className="g2">
                <div className="fg span2"><label className="fl">Building name <span className="req">*</span></label>
                  <input className="fi" placeholder="e.g. Crown House" value={a.premisesName||""} onChange={e=>upd({premisesName:e.target.value})}/></div>
                <div className="fg span2"><label className="fl">Full address <span className="req">*</span></label>
                  <textarea className="ft" style={{minHeight:56}} placeholder="Full address including postcode" value={a.premisesAddress||""} onChange={e=>upd({premisesAddress:e.target.value})}/></div>
                <div className="fg"><label className="fl">Type</label>
                  <select className="fs" value={a.premisesType||"Office"} onChange={e=>upd({premisesType:e.target.value})}>
                    {["Office","Retail","Industrial / Warehouse","Care Home","School / Educational","Hotel / Guest House","HMO / Residential","Licensed Premises","Mixed Use","Healthcare","Place of Assembly","Other"].map(t=><option key={t}>{t}</option>)}
                  </select></div>
                <div className="fg"><label className="fl">Assessment date</label>
                  <input className="fi" type="date" value={a.assessmentDate||""} onChange={e=>upd({assessmentDate:e.target.value})}/></div>
                <div className="fg"><label className="fl">Responsible person</label>
                  <input className="fi" placeholder="Name" value={a.rpName||""} onChange={e=>upd({rpName:e.target.value})}/></div>
                <div className="fg"><label className="fl">RP title</label>
                  <input className="fi" placeholder="Building Manager" value={a.rpTitle||""} onChange={e=>upd({rpTitle:e.target.value})}/></div>
              </div>
            </div>
            <div className="fcf">
              <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"GO",screen:"dashboard"})}>Cancel</button>
              <button className="btn btn-teal" onClick={()=>dispatch({type:"GO",screen:"assessment"})}>Start Assessment -></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function Dashboard({state, dispatch}) {
  const {org, assessments} = state;
  const ac = org.accentColor||"#0D7A7A";
  const pr = org.primaryColor||"#0D1117";
  const firstName = org.assessor?.split(" ")[0]||null;
  const completed = assessments.filter(a=>a.status==="complete");
  const drafts    = assessments.filter(a=>a.status==="draft");

  const activeDraft = drafts[drafts.length-1];
  const draftAns    = activeDraft?.answers||{};

  const sectionStatus = FRA_SECTIONS.map(s=>{
    const vqs    = visibleQs(s,draftAns);
    const reqDone= vqs.filter(q=>q.required).every(q=>isAnswered(q,draftAns[q.ref]||{}));
    const anyDone= vqs.some(q=>isAnswered(q,draftAns[q.ref]||{}));
    return {s,reqDone,anyDone};
  });

  const tools = [
    {key:"fra",icon:"🔥",tag:"FRA",name:"Fire Risk Assessment",desc:"Card-by-card · 163 questions · RRO 2005",accent:"#DC2626",accentBg:"#FEF2F2"},

  ];

  return (
    <div className="dash">
      <div className="tnav dk" style={{background:pr}}>
        <div className="tn-gem" style={{padding:0,background:"#fff",overflow:"hidden"}}><img src={_IMG0} style={{width:"100%",height:"100%",objectFit:"contain",display:"block",padding:"1px"}}/></div>
        <div className="tn-mid">
          <span style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:800,color:"#fff",letterSpacing:"-.3px"}}>Fire<em style={{color:ac,fontStyle:"normal"}}>site</em></span>
          <span style={{fontSize:9,color:"rgba(255,255,255,.28)",marginLeft:5,fontFamily:"'Nunito',sans-serif"}}>by Bluejai</span>{org.name&&<span style={{fontSize:9,color:"rgba(255,255,255,.28)",marginLeft:4}}>· {org.name}</span>}
        </div>
        {!state.isOnline && <span className="tn-offline">Offline</span>}
        <button className="btn btn-ghost btn-sm" style={{borderColor:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.3)"}} onClick={()=>dispatch({type:"EDIT_ORG"})}>⚙</button>
      </div>

      <div className="dash-scroll">
        <div className="dash-body">
          <div style={{marginBottom:18}}>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:24,fontWeight:700,color:"#1C1C1C",lineHeight:1.1,marginBottom:3}}>
              {firstName?`Morning, ${firstName}.`:"Your assessments."}
            </div>
            <div style={{fontSize:11,color:"#9CA3AF"}}>
              {assessments.length===0?"Start your first assessment below.":
               `${assessments.length} assessment${assessments.length>1?"s":""} · ${completed.length} complete · ${drafts.length} in progress`}
            </div>
          </div>

          {/* Heat map */}
          {activeDraft && (
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:11,fontWeight:600,color:"#2D2D2D"}}>📊 {activeDraft.premisesName||"Current draft"}</span>
                <span style={{fontSize:10,color:ac,fontWeight:600,cursor:"pointer"}} onClick={()=>dispatch({type:"SET_ACTIVE",id:activeDraft.id,screen:"assessment"})}>Continue -></span>
              </div>
              <div className="heatmap">
                {sectionStatus.map(({s,reqDone,anyDone},i)=>(
                  <div key={i} className="hm-cell"
                    style={{background:reqDone?"#ECFDF5":anyDone?`${ac}0F`:"#F9FAFB",border:`1px solid ${reqDone?"#6EE7B7":anyDone?ac+"33":"#EAECF0"}`}}
                    onClick={()=>{dispatch({type:"SET_ACTIVE",id:activeDraft.id,screen:"assessment"});dispatch({type:"SEC",i});}}>
                    <div className="hm-num" style={{color:reqDone?"#059669":anyDone?ac:"#9CA3AF"}}>{reqDone?"✓":i+1}</div>
                    <div className="hm-lbl" style={{color:reqDone?"#059669":anyDone?ac:"#9CA3AF"}}>{s.short||s.title.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
              {activeDraft.answers&&(
                <div style={{fontSize:10,color:"#9CA3AF",textAlign:"right"}}>~{estMins(null,draftAns)} min remaining</div>
              )}
            </div>
          )}

          {/* Stats */}
          {assessments.length>0 && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
              {[{v:assessments.length,l:"Total",ic:"📋",col:pr},{v:completed.length,l:"Complete",ic:"✅",col:"#059669"},
                {v:drafts.reduce((n,a)=>n+Object.values(a.answers||{}).filter(v=>v?.flagged).length,0),l:"Flagged",ic:"⚑",col:ac}
              ].map((s,i)=>(
                <div key={i} style={{background:"#fff",border:"1px solid #EAECF0",borderRadius:9,padding:"11px 10px",display:"flex",gap:7,alignItems:"flex-start"}}>
                  <span style={{fontSize:15}}>{s.ic}</span>
                  <div>
                    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:20,fontWeight:700,color:s.col,lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:9,color:"#9CA3AF",marginTop:2}}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assessments */}
          {assessments.length>0 && (
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700,color:"#1C1C1C"}}>Assessments</div>
                <button className="btn btn-teal btn-sm" onClick={()=>dispatch({type:"NEW_ASSESSMENT"})}>＋ New</button>
              </div>
              {assessments.slice().reverse().map(a=>{
                const vTotal   = FRA_SECTIONS.reduce((n,s)=>n+visibleQs(s,a.answers||{}).length,0);
                const answered = Object.values(a.answers||{}).filter(v=>v&&(v.ans||(v.sel&&v.sel.length>0))).length;
                const pct      = Math.round((answered/TOTAL_Q)*100);
                const flagCount= Object.values(a.answers||{}).filter(v=>v?.flagged).length;
                return (
                  <div key={a.id} className={`atile ${a.status}`}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:5,gap:9}}>
                      <div>
                        <div className="at-ref">{a.ref}</div>
                        <div className="at-name">{a.premisesName||"Unnamed Premises"}</div>
                        <div className="at-addr">{a.premisesAddress||"Address not set"}</div>
                      </div>
                      <span className="abadge" style={{
                        background:a.status==="complete"?"#ECFDF5":"#FDF3EE",
                        color:a.status==="complete"?"#059669":ac,
                        border:`1px solid ${a.status==="complete"?"#6EE7B7":ac+"44"}`,
                        flexShrink:0,whiteSpace:"nowrap"
                      }}>{a.status==="complete"?"✓ Complete":"In Progress"}</span>
                    </div>
                    <div className="at-meta">
                      {a.premisesType&&<span className="abadge" style={{background:"#F3F4F6",color:"#6B7280"}}>{a.premisesType}</span>}
                      {a.clientName&&<span className="abadge" style={{background:"#F3F4F6",color:"#6B7280"}}>{a.clientName}</span>}
                      {a.riskRating&&<span className="abadge" style={{background:riskBg(a.riskRating),color:riskCol(a.riskRating),border:`1px solid ${riskCol(a.riskRating)}33`}}>{a.riskRating.split("—")[0].trim()}</span>}
                      {flagCount>0&&<span className="abadge" style={{background:"#FDF3EE",color:ac}}>⚑ {flagCount}</span>}
                      {a.savedAt&&<span style={{fontSize:9,color:"#9CA3AF"}}>Saved {a.savedAt}</span>}
                    </div>
                    {a.status==="draft"&&answered>0&&(
                      <div style={{marginBottom:7}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:9,color:"#9CA3AF"}}>{pct}% complete</span>
                          <span style={{fontSize:9,color:ac,fontWeight:600}}>~{estMins(null,a.answers||{})} min left</span>
                        </div>
                        <div className="at-prog"><div className="at-prog-fill" style={{width:`${pct}%`,background:ac}}/></div>
                      </div>
                    )}
                    <div style={{display:"flex",gap:7}}>
                      <button className="btn btn-teal btn-sm" onClick={()=>dispatch({type:"SET_ACTIVE",id:a.id,screen:a.status==="complete"?"complete":"assessment"})}>
                        {a.status==="complete"?"📄 Report":"Continue ->"}
                      </button>
                      {a.status==="complete"&&<button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"SET_ACTIVE",id:a.id,screen:"assessment"})}>Edit</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tool cards */}
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700,color:"#1C1C1C",marginBottom:3}}>Assessment Types</div>
          <div style={{fontSize:10,color:"#9CA3AF",marginBottom:10}}>Professional forms for every fire safety assessment</div>
          <div className="tool-grid">
            {tools.map(t=>(
              <div key={t.key} className="tcrd" onClick={()=>t.key==="fra"&&dispatch({type:"NEW_ASSESSMENT"})}>
                <div className="tcrd-top">
                  <div className="tcrd-ic">{t.icon}</div>
                  <div className="tcrd-tag" style={{color:t.accent}}>{t.tag}</div>
                  <div className="tcrd-name">{t.name}</div>
                  <div className="tcrd-desc">{t.desc}</div>
                </div>
                <div className="tcrd-ft">
                  <button className="tcrd-btn" style={{borderColor:t.accent,color:t.accent}}
                    onMouseEnter={e=>{e.currentTarget.style.background=t.accent;e.currentTarget.style.color="#fff";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=t.accent;}}
                    onClick={e=>{e.stopPropagation();t.key==="fra"&&dispatch({type:"NEW_ASSESSMENT"});}}>
                    {t.key==="fra"?"Start New ->":"Coming Soon"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ASSESSMENT — card-by-card flow ──────────────────────────────
function Assessment({state, dispatch}) {
  const a = state.assessments.find(x=>x.id===state.activeId);
  if (!a) return <div style={{padding:40,textAlign:"center",color:"#9CA3AF"}}>Assessment not found. <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"GO",screen:"dashboard"})}>Back</button></div>;

  const {org, showMissed} = state;
  const ac = org.accentColor||"#0D7A7A";
  const pr = org.primaryColor||"#0D1117";
  const answers = a.answers||{};
  const secIdx  = a.secIdx||0;
  const qIdx    = a.qIdx||0;
  const mode    = a.mode||"card";   // "start" | "card" | "end" | "review"

  const curSec  = FRA_SECTIONS[secIdx];
  const intro   = SECTION_INTROS[curSec.id];
  const vqs     = visibleQs(curSec, answers);  // skip-logic filtered

  const totalAnswered = FRA_SECTIONS.reduce((n,s)=>n+visibleQs(s,answers).filter(q=>isAnswered(q,answers[q.ref]||{})).length,0);
  const totalVisible  = FRA_SECTIONS.reduce((n,s)=>n+visibleQs(s,answers).length,0);
  const pct           = Math.round((totalAnswered/totalVisible)*100);
  const flagged       = Object.values(answers).filter(v=>v?.flagged).length;

  const allMissed = FRA_SECTIONS.flatMap(s=>
    visibleQs(s,answers).filter(q=>isMissed(q,answers[q.ref])).map(q=>({...q,secId:s.id}))
  );

  const secDone = s => visibleQs(s,answers).filter(q=>q.required).every(q=>isAnswered(q,answers[q.ref]||{}));
  const secMiss = s => visibleQs(s,answers).some(q=>isMissed(q,answers[q.ref]));
  const secAns  = s => visibleQs(s,answers).filter(q=>isAnswered(q,answers[q.ref]||{})).length;
  const secFlag = s => s.questions.filter(q=>answers[q.ref]?.flagged).length;

  const saveTimer = useRef(null);
  const [saveAnim, setSaveAnim] = useState(false);

  const setAns = useCallback((ref, patch) => {
    const now = new Date();
    const ts  = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
    dispatch({type:"ANS", ref, patch, ts});
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(()=>{
      setSaveAnim(true);
      setTimeout(()=>setSaveAnim(false), 2000);
    }, 800);
  }, [dispatch]);

  const rememberPerson = name => dispatch({type:"REMEMBER_PERSON", name});

  // Navigation within card flow
  const goNextQ = () => {
    if (qIdx < vqs.length-1) {
      dispatch({type:"Q_IDX", i:qIdx+1});
    } else {
      // End of section
      dispatch({type:"SET_MODE", mode:"end"});
    }
  };

  const goPrevQ = () => {
    if (qIdx > 0) {
      dispatch({type:"Q_IDX", i:qIdx-1});
    } else if (secIdx > 0) {
      // Go back to end of previous section
      dispatch({type:"SEC", i:secIdx-1});
      dispatch({type:"SET_MODE", mode:"review"});
    }
  };

  const startSection = () => dispatch({type:"SET_MODE", mode:"card"});

  const goNextSec = () => {
    if (secIdx < FRA_SECTIONS.length-1) {
      dispatch({type:"SEC", i:secIdx+1});
      dispatch({type:"SET_MODE", mode:"start"});
    } else {
      dispatch({type:"SHOW_VALIDATION"});
    }
  };

  const curQ = vqs[qIdx];

  // Dot progress for section tabs
  const secProgress = (s) => {
    const vq = visibleQs(s, answers);
    const done = vq.filter(q=>isAnswered(q,answers[q.ref]||{})).length;
    return {done, total:vq.length};
  };

  return (
    <div className="assess-wrap">

      {/* Sticky top nav only — no intro banner sticking */}
      <div className="assess-head">
        <div className="tnav dk" style={{background:pr}}>
          <button className="tn-back" onClick={()=>dispatch({type:"GO",screen:"dashboard"})}>← Back</button>
          <div className="tn-mid">
            <div className="tn-title dk" style={{fontSize:12}}>{a.premisesName||"Assessment"}</div>
            <div className="tn-sub">{a.ref}</div>
          </div>
          <div className="tn-save">
            {saveAnim
              ? <span style={{color:"#34D399",fontSize:9}}>● Saved</span>
              : a.savedAt ? <span style={{color:"rgba(255,255,255,.2)",fontSize:9}}>{a.savedAt}</span>
              : null}
          </div>
          {!state.isOnline && <span className="tn-offline">Offline</span>}
          {allMissed.length>0&&mode==="card"&&(
            <button style={{fontSize:9,fontWeight:600,background:"#DC262614",border:"1px solid #DC262633",color:"#DC2626",padding:"3px 8px",borderRadius:10,cursor:"pointer"}}
              onClick={()=>dispatch({type:"SHOW_MISSED"})}>⚠{allMissed.length}</button>
          )}
        </div>

        {/* Section dot progress bar */}
        <div className="sec-dots-bar">
          <div className="sec-dot-row">
            {FRA_SECTIONS.map((s,i)=>{
              const done = secDone(s);
              const any  = secAns(s)>0;
              const active = secIdx===i;
              const {done:doneCount,total:totalQ} = secProgress(s);
              const fillPct = totalQ>0 ? (doneCount/totalQ) : 0;
              return (
                <div key={i} className="sec-dot-item"
                  style={{
                    flex:active?3:1,
                    background:done?"#059669":active?ac:any?`${ac}55`:"rgba(255,255,255,.12)",
                    cursor:"pointer",
                    opacity:active?1:.7,
                  }}
                  onClick={()=>{dispatch({type:"SEC",i});dispatch({type:"SET_MODE",mode:"start"});}}
                  title={s.title}/>
              );
            })}
          </div>
          <div className="sec-label-row">
            <span style={{color:ac,fontWeight:700}}>{pct}%</span>
            <span style={{marginLeft:4}}>{secIdx+1}/{FRA_SECTIONS.length}</span>
          </div>
        </div>

        {/* Section tabs — scroll horizontally, compact */}
        <div className="stabs">
          {FRA_SECTIONS.map((s,i)=>{
            const done  = secDone(s);
            const miss  = secMiss(s)&&showMissed;
            const active= secIdx===i;
            return (
              <button key={s.id} className={`stab ${active?"on":done?"done":miss?"miss":""}`}
                style={active?{borderBottomColor:ac}:{}}
                onClick={()=>{dispatch({type:"SEC",i});dispatch({type:"SET_MODE",mode:"start"});}}>
                {done&&!active?"✓ ":""}{s.short}
                {miss&&!active&&<span className="stab-miss-dot"/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card area */}
      <div className="card-area">

        {/* ── SECTION START CARD ── */}
        {mode==="start" && (
          <div className="sec-start fade">
            <div className="ss-icon">{intro?.icon||"📋"}</div>
            <div className="ss-num" style={{color:intro?.colour||ac}}>Section {curSec.id} of {FRA_SECTIONS.length}</div>
            <div className="ss-title">{curSec.title}</div>
            <div className="ss-desc">{intro?.text||""}</div>
            <div className="ss-meta">
              <span className="ss-pill">{vqs.length} question{vqs.length!==1?"s":""}</span>
              <span className="ss-pill">~{intro?.mins||3} min</span>
              {secAns(curSec)>0&&<span className="ss-pill" style={{background:"#ECFDF5",color:"#059669",borderColor:"#6EE7B744"}}>{secAns(curSec)} done</span>}
            </div>
            <button className="ss-begin" style={{background:pr}} onClick={startSection}>
              {secAns(curSec)>0?"Continue section ->":"Begin section ->"}
            </button>
            {secIdx>0&&<button style={{background:"none",border:"none",fontSize:11,color:"#9CA3AF",cursor:"pointer",marginTop:12}} onClick={()=>{dispatch({type:"SEC",i:secIdx-1});dispatch({type:"SET_MODE",mode:"end"});}}>← Previous section</button>}
          </div>
        )}

        {/* ── QUESTION CARD ── */}
        {mode==="card" && curQ && (
          <>
            <QuestionCard
              q={curQ}
              qIdx={qIdx}
              totalVisible={vqs.length}
              state={answers[curQ.ref]||{}}
              onChange={patch=>setAns(curQ.ref,patch)}
              onNext={goNextQ}
              onPrev={goPrevQ}
              showMissed={showMissed}
              sectionId={curSec.id}
              recentPersons={org.recentPersons||[]}
              onRememberPerson={rememberPerson}
            />
            <div className="q-footer">
              <button className="q-prev" onClick={goPrevQ} disabled={secIdx===0&&qIdx===0}>&#8592;</button>
              <button className="q-next" style={{background:isAnswered(curQ,answers[curQ.ref]||{})?ac:pr}}
                onClick={goNextQ}>
                {qIdx<vqs.length-1
                  ? isAnswered(curQ,answers[curQ.ref]||{}) ? "Next ->" : "Skip ->"
                  : "Finish section ->"}
              </button>
              {!isAnswered(curQ,answers[curQ.ref]||{})&&(
                <button className="q-skip" onClick={goNextQ} title="Skip this question">Skip</button>
              )}
            </div>
          </>
        )}

        {/* ── SECTION END CARD ── */}
        {mode==="end" && (
          <div className="sec-end fade">
            <div className="se-icon">{secDone(curSec)?"✅":"📋"}</div>
            <div className="se-title">{secDone(curSec)?`Section ${curSec.id} complete!`:`Section ${curSec.id} done`}</div>
            <div className="se-sub">
              {curSec.title}<br/>
              {secAns(curSec)} of {vqs.length} questions answered
              {secFlag(curSec)>0&&` · ${secFlag(curSec)} flagged`}
            </div>
            <div className="se-stats">
              <span className="se-stat" style={{background:"#ECFDF5",color:"#059669"}}>{secAns(curSec)} answered</span>
              {secFlag(curSec)>0&&<span className="se-stat" style={{background:"#FDF3EE",color:ac}}>⚑ {secFlag(curSec)} flagged</span>}
              {secMiss(curSec)&&<span className="se-stat" style={{background:"#FEF2F2",color:"#DC2626"}}>⚠ {visibleQs(curSec,answers).filter(q=>isMissed(q,answers[q.ref])).length} missing</span>}
            </div>
            <button className="se-next" onClick={goNextSec}>
              {secIdx<FRA_SECTIONS.length-1?`${FRA_SECTIONS[secIdx+1].title} ->`:"Complete Assessment ->"}
            </button>
            <button className="se-review" onClick={()=>dispatch({type:"SET_MODE",mode:"review"})}>
              Review this section
            </button>
          </div>
        )}

        {/* ── REVIEW MODE ── */}
        {mode==="review" && (
          <>
            <div style={{padding:"12px 16px",background:"#fff",borderBottom:"1px solid #EAECF0",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700,flex:1}}>{curSec.title} — Review</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"SET_MODE",mode:"end"})}>Done reviewing</button>
            </div>
            <div className="review-mode">
              {vqs.map((q,i)=>{
                const ans = answers[q.ref];
                const answered = isAnswered(q,ans||{});
                const missed   = isMissed(q,ans);
                const flaggedQ = ans?.flagged;
                return (
                  <div key={q.ref} className="review-q"
                    onClick={()=>{dispatch({type:"Q_IDX",i});dispatch({type:"SET_MODE",mode:"card"});}}>
                    <span className="rq-ref">{q.ref}</span>
                    <span className="rq-text">{q.q.length>80?q.q.slice(0,80)+"…":q.q}</span>
                    {missed ? <span className="rq-ans miss">⚠ Required</span>
                    : flaggedQ ? <span className="rq-ans flag">⚑ Flagged</span>
                    : ans?.ans==="y" ? <span className="rq-ans y">Yes</span>
                    : ans?.ans==="n" ? <span className="rq-ans n">No</span>
                    : ans?.ans==="na" ? <span className="rq-ans na">N/A</span>
                    : ans?.sel?.length>0 ? <span className="rq-ans y">{ans.sel.length} selected</span>
                    : ans?.ans ? <span className="rq-ans y">Answered</span>
                    : <span style={{fontSize:10,color:"#D1D5DB"}}>—</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Validation modal */}
      {state.showValidation && (
        <div className="modal-ov" onClick={()=>dispatch({type:"GO",screen:"assessment"})}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-h">
              <span className="modal-t">{allMissed.length>0?"Incomplete Questions":"Complete Assessment"}</span>
              <button className="modal-x" onClick={()=>dispatch({type:"GO",screen:"assessment"})}>&#10005;</button>
            </div>
            <div className="modal-b">
              {allMissed.length>0 ? (
                <div style={{display:"flex",gap:9,padding:"11px 13px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,marginBottom:12}}>
                  <span style={{fontSize:15,flexShrink:0}}>&#9888;</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:12,color:"#991B1B",marginBottom:3}}>{allMissed.length} required question{allMissed.length>1?"s":""} unanswered</div>
                    <div style={{fontSize:11,color:"#B91C1C",lineHeight:1.6}}>These may affect the defensibility of your report under the RRO 2005.</div>
                  </div>
                </div>
              ) : (
                <p style={{fontSize:13,color:"#2D2D2D",lineHeight:1.65,marginBottom:12}}>All required questions answered. Ready to generate your report.</p>
              )}
            </div>
            <div className="modal-f">
              <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"GO",screen:"assessment"})}>
                {allMissed.length>0?"Go back":"Cancel"}
              </button>
              <button className="btn btn-teal btn-sm" onClick={()=>{
                const riskAns = a.answers?.["OR.3"]?.ans;
                const nextRev = a.answers?.["OR.4"]?.ans;
                dispatch({type:"COMPLETE",ts:fmtDate(new Date().toISOString()),riskRating:riskAns,nextReview:nextRev});
              }}>
                {allMissed.length>0?"Generate anyway ->":"Generate Report ->"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
// ─── PDF GENERATOR ────────────────────────────────────────────────
// Uses browser print API with dedicated print window
// Works on all mobile browsers — no external dependencies

function generatePDF(a, org) {
  const answers    = a.answers || {};
  const ac         = org.accentColor  || "#0D7A7A";
  const pr         = org.primaryColor || "#0D1117";
  const risk       = a.riskRating || "";

  const actionItems = Object.entries(answers)
    .filter(([,v]) => v?.flagged)
    .map(([ref,v]) => {
      const q = FRA_SECTIONS.flatMap(s=>s.questions).find(q=>q.ref===ref);
      return {
        ref, text:q?.q||"",
        action:    v.action||"",
        priority:  v.priority||"P3 — Within 3 months",
        responsible: v.responsible||"",
        targetDate:  v.targetDate||"",
        actionStatus:v.actionStatus||"pending",
        photos:    v.photos||[],
        note:      v.note||"",
      };
    });

  const allPhotos = Object.entries(answers).flatMap(([ref,v]) =>
    (v?.photos||[]).map(p => ({
      ...p, ref,
      questionText: FRA_SECTIONS.flatMap(s=>s.questions).find(q=>q.ref===ref)?.q||""
    }))
  );

  const positiveFindings = Object.entries(answers)
    .filter(([,v]) => v?.ans==="y" && v?.note && v.note.trim())
    .map(([ref,v]) => ({
      ref,
      note: v.note,
      text: FRA_SECTIONS.flatMap(s=>s.questions).find(q=>q.ref===ref)?.q||""
    }))
    .slice(0, 10);

  const pColor = p =>
    p?.includes("P1") ? "#B91C1C" :
    p?.includes("P2") ? "#D97706" :
    p?.includes("P3") ? "#E05A1A" : "#059669";

  const rCol = r =>
    r?.startsWith("Critical") ? "#B91C1C" :
    r?.startsWith("High")     ? "#D97706" :
    r?.startsWith("Medium")   ? "#D97706" : "#059669";

  const secsDone = FRA_SECTIONS.filter(s =>
    s.questions.filter(q=>q.required).every(q=>isAnswered(q,(answers)[q.ref]||{}))
  ).length;

  const execSummary =
    "This fire risk assessment was carried out at " +
    (a.premisesName||"the premises") + " on " + fmtDate(a.assessmentDate) +
    " by " + (org.assessor||"the assessor") + (org.quals ? " (" + org.quals + ")" : "") +
    ". The assessment covered " + secsDone + " of " + FRA_SECTIONS.length +
    " sections in accordance with the Regulatory Reform (Fire Safety) Order 2005." +
    " The overall fire risk rating assigned to these premises is " +
    (risk ? risk.split("—")[0].trim() : "not yet set") + "." +
    " A total of " + actionItems.length + " significant finding" +
    (actionItems.length !== 1 ? "s were" : " was") + " identified during the assessment" +
    (actionItems.filter(x=>x.priority?.includes("P1")).length > 0
      ? ", of which " + actionItems.filter(x=>x.priority?.includes("P1")).length +
        " require" + (actionItems.filter(x=>x.priority?.includes("P1")).length === 1 ? "s" : "") +
        " immediate action"
      : "") + "." +
    (positiveFindings.length > 0
      ? " A number of positive fire safety arrangements were also observed." : "") +
    " The Responsible Person is advised to implement all recommended actions within the timescales specified in the Action Plan.";

  // Photo to data URL (already base64 from camera capture)
  const photoImg = (p, w, h) =>
    p.src ? `<img src="${p.src}" style="width:${w}px;height:${h}px;object-fit:cover;border-radius:4px;border:1px solid #EAECF0;" alt="${p.caption||"Evidence photo"}"/>` : "";

  const logoTag = org.logo
    ? `<img src="${org.logo}" style="height:28px;object-fit:contain;border-radius:3px;" alt="logo"/>`
    : `<div style="width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:13px;">🔥</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Fire Risk Assessment — ${a.premisesName||"Report"} — ${a.ref}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Nunito',sans-serif;font-size:10pt;color:#1C1C1C;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .serif{font-family:'Nunito',sans-serif;}
  .mono{font-family:'JetBrains Mono',monospace;}

  /* PAGE BREAKS */
  .page{page-break-after:always;min-height:100vh;position:relative;}
  .page:last-child{page-break-after:avoid;}
  .no-break{page-break-inside:avoid;}

  /* COVER PAGE */
  .cover{background:${pr};padding:48px 44px 36px;position:relative;overflow:hidden;min-height:360px;}
  .cover::after{content:'';position:absolute;bottom:-40px;right:-40px;width:200px;height:200px;border-radius:50%;border:32px solid rgba(255,255,255,.05);}
  .cover-logo-row{display:flex;align-items:center;gap:10px;margin-bottom:36px;position:relative;}
  .cover-org{font-family:'Nunito',sans-serif;font-size:14pt;font-weight:700;color:#fff;}
  .cover-org-sub{font-size:8pt;color:rgba(255,255,255,.4);margin-top:2px;}
  .cover-rule{width:36px;height:2px;background:${ac};margin-bottom:10px;position:relative;}
  .cover-doc-type{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${ac};margin-bottom:8px;position:relative;}
  .cover-title{font-family:'Nunito',sans-serif;font-size:26pt;font-weight:700;color:#fff;line-height:1.1;position:relative;}
  .cover-subtitle{font-size:14pt;opacity:.55;margin-top:4px;}
  .cover-stripe{height:3px;background:linear-gradient(90deg,${ac},transparent);}
  .cover-meta{display:grid;grid-template-columns:1fr 1fr;}
  .cover-mc{padding:10px 16px;border-right:1px solid #F3F4F6;border-bottom:1px solid #F3F4F6;}
  .cover-mc:nth-child(even){border-right:none;}
  .cover-ml{font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9CA3AF;margin-bottom:2px;}
  .cover-mv{font-size:10pt;font-weight:600;color:#1C1C1C;}
  .cover-mv.risk{color:${rCol(risk)};}
  .cover-foot{padding:8px 16px;background:#F9FAFB;display:flex;justify-content:space-between;border-top:1px solid #EAECF0;}
  .cover-fl{font-size:7.5pt;color:#9CA3AF;}

  /* PAGE HEADER */
  .pg-hdr{background:${pr};padding:7px 16px;display:flex;justify-content:space-between;align-items:center;}
  .pg-hdr-brand{font-family:'Nunito',sans-serif;font-size:10pt;font-weight:700;color:#fff;}
  .pg-hdr-ref{font-family:'JetBrains Mono',monospace;font-size:7pt;color:rgba(255,255,255,.3);}
  .pg-hdr-doc{font-size:7pt;color:${ac};font-weight:600;margin-left:8px;}

  /* PAGE BODY */
  .pg-body{padding:24px 20px;}

  /* PAGE FOOTER */
  .pg-ftr{border-top:1px solid #EAECF0;padding:6px 16px;display:flex;justify-content:space-between;background:#F9FAFB;position:absolute;bottom:0;left:0;right:0;}
  .pg-fl{font-size:7pt;color:#9CA3AF;}

  /* SECTION HEADINGS */
  .sec-h{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #EAECF0;}
  .sec-n{font-family:'Nunito',sans-serif;font-size:28pt;font-weight:700;color:#EAECF0;line-height:1;flex-shrink:0;}
  .sec-t{font-family:'Nunito',sans-serif;font-size:14pt;font-weight:700;color:#1C1C1C;}
  .sec-l{font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${ac};margin-bottom:2px;}

  /* BODY TEXT */
  p.body{font-size:9.5pt;line-height:1.75;color:#4B5563;margin-bottom:10px;}

  /* PREMISES TABLE */
  table.info{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:14px;}
  table.info td{padding:6px 0;border-bottom:1px solid #F3F4F6;vertical-align:top;}
  table.info td.lbl{width:110px;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#9CA3AF;padding-right:10px;}

  /* FINDINGS */
  .finding{padding:10px 0;border-bottom:1px solid #F3F4F6;}
  .finding:last-child{border-bottom:none;}
  .finding-head{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;}
  .finding-ref{font-family:'JetBrains Mono',monospace;font-size:7.5pt;color:#9CA3AF;flex-shrink:0;margin-top:2px;}
  .finding-text{font-size:9.5pt;color:#2D2D2D;line-height:1.5;flex:1;}
  .finding-pri{font-size:7.5pt;font-weight:700;padding:1px 7px;border-radius:8px;flex-shrink:0;}
  .finding-action{font-size:8.5pt;color:#6B7280;font-style:italic;margin-left:26px;margin-bottom:6px;line-height:1.5;}
  .finding-photos{display:flex;gap:6px;flex-wrap:wrap;margin-left:26px;margin-top:6px;}
  .finding-photo{display:flex;flex-direction:column;gap:2px;}
  .finding-cap{font-size:6.5pt;color:#9CA3AF;max-width:68px;line-height:1.3;}

  /* ACTION PLAN TABLE */
  table.action{width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:14px;}
  table.action th{background:${pr};color:#fff;padding:6px 8px;text-align:left;font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.3px;}
  table.action td{padding:7px 8px;border-bottom:1px solid #F3F4F6;line-height:1.5;vertical-align:top;}
  table.action tr:nth-child(even) td{background:#F9FAFB;}

  /* RISK MATRIX */
  .matrix{width:100%;border-collapse:collapse;border:1px solid #EAECF0;border-radius:6px;overflow:hidden;font-size:8pt;margin-bottom:14px;}
  .matrix th{background:#F9FAFB;padding:5px 8px;text-align:center;font-size:6.5pt;font-weight:700;text-transform:uppercase;color:#6B7280;border-bottom:1px solid #EAECF0;}
  .matrix td{padding:8px;text-align:center;font-weight:700;font-size:8pt;border:1px solid #EAECF0;}
  .c-tr{background:#ECFDF5;color:#7B1C1C;}
  .c-to{background:#FFFBEB;color:#92400E;}
  .c-mo{background:#FEF3C7;color:#B45309;}
  .c-su{background:#FEF2F2;color:#991B1B;}
  .c-in{background:#7B1C1C;color:#FECACA;}
  .matrix .row-hd{background:#F9FAFB;font-size:6.5pt;font-weight:700;text-transform:uppercase;color:#6B7280;text-align:left;padding-left:8px;}

  /* RISK BOX */
  .risk-box{border-radius:8px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;}

  /* SIGNATURE */
  .sig-card{border:1px solid #EAECF0;border-radius:6px;overflow:hidden;margin-bottom:12px;}
  .sig-head{background:#F9FAFB;padding:6px 12px;font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9CA3AF;border-bottom:1px solid #EAECF0;}
  .sig-body{padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .sig-f{display:flex;flex-direction:column;gap:3px;}
  .sig-l{font-size:6.5pt;font-weight:700;text-transform:uppercase;color:#9CA3AF;}
  .sig-v{font-size:10pt;font-weight:600;padding-bottom:3px;border-bottom:1.5px solid #0D1117;}
  .sig-c{border:1px dashed #D1D5DB;border-radius:3px;height:36px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:9pt;font-style:italic;}

  /* PHOTO APPENDIX */
  .photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .photo-item{display:flex;flex-direction:column;gap:3px;}
  .photo-item-ref{font-family:'JetBrains Mono',monospace;font-size:6.5pt;color:#9CA3AF;}
  .photo-item-cap{font-size:7.5pt;color:#2D2D2D;line-height:1.4;}

  /* PRINT SETTINGS */
  @media print {
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{page-break-after:always;min-height:0;}
    .page:last-child{page-break-after:avoid;}
    @page{margin:0;size:A4;}
  }
</style>
</head>
<body>

<!-- ══ PAGE 1: COVER ══════════════════════════════════════════════ -->
<div class="page">
  <div class="cover">
    <div class="cover-logo-row">
      ${logoTag}
      <div>
        <div class="cover-org">${org.name||"Assessor"}</div>
        ${org.assessor ? `<div class="cover-org-sub">${org.assessor}${org.quals?" · "+org.quals:""}</div>` : ""}
      </div>
    </div>
    <div class="cover-rule"></div>
    <div class="cover-doc-type">Fire Risk Assessment Report</div>
    <div class="cover-title">
      ${a.premisesName||"Premises Name"}
      <div class="cover-subtitle">${a.premisesAddress||""}</div>
    </div>
  </div>
  <div class="cover-stripe"></div>
  <div class="cover-meta">
    <div class="cover-mc"><div class="cover-ml">Assessment Reference</div><div class="cover-mv" style="font-family:'JetBrains Mono',monospace;font-size:9pt;">${a.ref}</div></div>
    <div class="cover-mc"><div class="cover-ml">Date of Assessment</div><div class="cover-mv">${fmtDate(a.assessmentDate)}</div></div>
    <div class="cover-mc"><div class="cover-ml">Overall Risk Rating</div><div class="cover-mv risk">${risk?(risk.split("—")[0].trim().toUpperCase()):"NOT YET SET"}</div></div>
    <div class="cover-mc"><div class="cover-ml">Next Review Date</div><div class="cover-mv">${a.nextReview||"—"}</div></div>
    <div class="cover-mc"><div class="cover-ml">Responsible Person</div><div class="cover-mv">${(a.rpName||"—")+(a.rpTitle?", "+a.rpTitle:"")}</div></div>
    <div class="cover-mc"><div class="cover-ml">Client</div><div class="cover-mv">${a.clientName||"—"}</div></div>
  </div>
  <div class="cover-foot">
    <span class="cover-fl">Prepared by: ${org.assessor||"Assessor"}${org.quals?" · "+org.quals:""}</span>
    <span style="font-size:7.5pt;font-weight:700;color:${pr};">Firesite™ · Bluejai Ltd</span>
  </div>
</div>

<!-- ══ PAGE 2: PREMISES & INTRODUCTION ═══════════════════════════ -->
<div class="page">
  <div class="pg-hdr">
    <div><span class="pg-hdr-brand">${org.name||"Assessor"}</span><span class="pg-hdr-doc">Fire Risk Assessment</span></div>
    <span class="pg-hdr-ref">${a.ref} · ${a.premisesName||""}</span>
  </div>
  <div class="pg-body" style="padding-bottom:48px;">
    <div class="sec-h"><div class="sec-n">A</div><div><div class="sec-l">Section A</div><div class="sec-t">Premises & General Information</div></div></div>
    <table class="info"><tbody>
      <tr><td class="lbl">Client</td><td>${a.clientName||"—"}</td></tr>
      <tr><td class="lbl">Client Contact</td><td>${a.clientContact||"—"}</td></tr>
      <tr><td class="lbl">Premises Address</td><td>${a.premisesAddress||"—"}</td></tr>
      <tr><td class="lbl">Premises Type</td><td>${a.premisesType||"—"}</td></tr>
      <tr><td class="lbl">Responsible Person</td><td>${(a.rpName||"—")+(a.rpTitle?", "+a.rpTitle:"")}</td></tr>
      <tr><td class="lbl">Lead Assessor</td><td>${(org.assessor||"—")+(org.quals?" "+org.quals:"")}</td></tr>
      <tr><td class="lbl">Assessment Type</td><td>${org.assessType||"Type 1 — Non-Intrusive"}</td></tr>
      <tr><td class="lbl">Date of Assessment</td><td>${fmtDate(a.assessmentDate)}</td></tr>
      <tr><td class="lbl">Legislation</td><td>Regulatory Reform (Fire Safety) Order 2005 · Fire Safety Act 2021 · Fire Safety (England) Regulations 2022</td></tr>
    </tbody></table>

    <div class="sec-h"><div class="sec-n">B</div><div><div class="sec-l">Section B</div><div class="sec-t">Executive Summary</div></div></div>
    <p class="body">${execSummary}</p>

    <div class="sec-h"><div class="sec-n">C</div><div><div class="sec-l">Section C</div><div class="sec-t">Introduction & Scope</div></div></div>
    <p class="body">This fire risk assessment has been carried out by a competent assessor to assist the Responsible Person in meeting their duties under Article 9 of the Regulatory Reform (Fire Safety) Order 2005. The assessment is a ${org.assessType||"Type 1 — Non-Intrusive"} examination of the premises and fire safety management arrangements in place at the time of inspection.</p>
    <p class="body">This report identifies potential fire hazards to life safety, evaluates the adequacy of existing fire precautions and makes recommendations where deficiencies are identified. Findings are based on conditions observed at the time of the assessment on ${fmtDate(a.assessmentDate)}.</p>
    ${org.disclaimer ? `<p class="body" style="font-style:italic;color:#6B7280;">${org.disclaimer}</p>` : ""}
  </div>
  <div class="pg-ftr"><span class="pg-fl">© ${new Date().getFullYear()} ${org.name||"Assessor"} · Confidential</span><span style="font-size:7pt;font-weight:700;color:${pr};">Firesite™</span><span class="pg-fl">Page 2 of 7</span></div>
</div>

<!-- ══ PAGE 3: RISK EVALUATION ═══════════════════════════════════ -->
<div class="page">
  <div class="pg-hdr">
    <div><span class="pg-hdr-brand">${org.name||"Assessor"}</span><span class="pg-hdr-doc">Fire Risk Assessment</span></div>
    <span class="pg-hdr-ref">${a.ref}</span>
  </div>
  <div class="pg-body" style="padding-bottom:48px;">
    <div class="sec-h"><div class="sec-n">D</div><div><div class="sec-l">Section D</div><div class="sec-t">Risk Evaluation</div></div></div>
    ${risk ? `
    <div class="risk-box" style="background:${risk.startsWith("Critical")?"#FEF2F2":risk.startsWith("High")?"#FFFBEB":"#FFFBEB"};border:1px solid ${rCol(risk)}44;">
      <div>
        <div class="serif" style="font-size:18pt;font-weight:700;color:${rCol(risk)};margin-bottom:4px;">${risk.split("—")[0].trim()}</div>
        <div style="font-size:8.5pt;color:#2D2D2D;line-height:1.6;">${risk.split("—").slice(1).join("—").trim()}</div>
      </div>
    </div>` : `<p class="body">Overall risk rating not set. Complete Section 12 to record the risk rating.</p>`}

    <p class="body" style="font-size:8.5pt;">The following risk matrix shows the relationship between the likelihood of fire and the potential severity of harm. The overall risk rating assigned to these premises is shown above.</p>

    <table class="matrix">
      <thead><tr><th></th><th>Slight Harm</th><th>Moderate Harm</th><th>Extreme Harm</th></tr></thead>
      <tbody>
        <tr><td class="row-hd">Low</td><td class="c-tr">Trivial</td><td class="c-to">Tolerable</td><td class="c-mo">Moderate</td></tr>
        <tr><td class="row-hd">Medium</td><td class="c-to">Tolerable</td><td class="c-mo">Moderate</td><td class="c-su">Substantial</td></tr>
        <tr><td class="row-hd">High</td><td class="c-mo">Moderate</td><td class="c-su">Substantial</td><td class="c-in">Intolerable</td></tr>
      </tbody>
    </table>

    ${positiveFindings.length > 0 ? `
    <div class="sec-h"><div class="sec-n">E</div><div><div class="sec-l">Section E</div><div class="sec-t">Positive Findings</div></div></div>
    <p class="body">The following positive fire safety arrangements were observed and recorded during the assessment.</p>
    ${positiveFindings.map(f => `
    <div class="finding no-break">
      <div class="finding-head">
        <span class="finding-ref">✓ ${f.ref}</span>
        <span class="finding-text" style="color:#059669;">${f.note}</span>
      </div>
    </div>`).join("")}` : ""}
  </div>
  <div class="pg-ftr"><span class="pg-fl">© ${new Date().getFullYear()} ${org.name||"Assessor"} · Confidential</span><span style="font-size:7pt;font-weight:700;color:${pr};">Firesite™</span><span class="pg-fl">Page 3 of 7</span></div>
</div>

<!-- ══ PAGE 4: SIGNIFICANT FINDINGS ══════════════════════════════ -->
<div class="page">
  <div class="pg-hdr">
    <div><span class="pg-hdr-brand">${org.name||"Assessor"}</span><span class="pg-hdr-doc">Fire Risk Assessment</span></div>
    <span class="pg-hdr-ref">${a.ref}</span>
  </div>
  <div class="pg-body" style="padding-bottom:48px;">
    <div class="sec-h"><div class="sec-n">F</div><div><div class="sec-l">Section F</div><div class="sec-t">Significant Findings</div></div></div>
    <p class="body">The following significant findings were identified during the assessment. Each finding is cross-referenced to the Action Plan in Section G. Photographic evidence is shown where recorded.</p>
    ${actionItems.length > 0 ? actionItems.map(item => `
    <div class="finding no-break">
      <div class="finding-head">
        <span class="finding-ref">${item.ref}</span>
        <span class="finding-text">${item.text?.slice(0,200)||item.action}</span>
        <span class="finding-pri" style="background:${item.priority?.includes("P1")?"#FEF2F2":item.priority?.includes("P2")?"#FFFBEB":"#FDF3EE"};color:${pColor(item.priority)};">${item.priority?.split(" — ")[0]||"P3"}</span>
      </div>
      ${item.action ? `<div class="finding-action">Action: ${item.action.slice(0,200)}${item.action.length>200?"…":""}</div>` : ""}
      ${item.photos.length > 0 ? `<div class="finding-photos">${item.photos.map(p => `
        <div class="finding-photo">
          ${photoImg(p, 68, 68)}
          <div class="finding-cap">${p.caption||"Ref "+item.ref}</div>
        </div>`).join("")}
      </div>` : ""}
    </div>`).join("") : `<p class="body" style="color:#9CA3AF;font-style:italic;">No significant findings recorded.</p>`}
  </div>
  <div class="pg-ftr"><span class="pg-fl">© ${new Date().getFullYear()} ${org.name||"Assessor"} · Confidential</span><span style="font-size:7pt;font-weight:700;color:${pr};">Firesite™</span><span class="pg-fl">Page 4 of 7</span></div>
</div>

<!-- ══ PAGE 5: ACTION PLAN ════════════════════════════════════════ -->
<div class="page">
  <div class="pg-hdr">
    <div><span class="pg-hdr-brand">${org.name||"Assessor"}</span><span class="pg-hdr-doc">Fire Risk Assessment</span></div>
    <span class="pg-hdr-ref">${a.ref}</span>
  </div>
  <div class="pg-body" style="padding-bottom:48px;">
    <div class="sec-h"><div class="sec-n">G</div><div><div class="sec-l">Section G</div><div class="sec-t">Action Plan</div></div></div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px;">
      ${[["P1","Immediate","#B91C1C"],["P2","Within 1 month","#D97706"],["P3","Within 3 months","#E05A1A"],["P4","Within 12 months","#059669"]].map(([p,l,c])=>`
      <div style="display:flex;align-items:center;gap:4px;font-size:7pt;padding:2px 8px;background:${c}11;border:1px solid ${c}22;border-radius:8px;">
        <span style="width:5px;height:5px;border-radius:50%;background:${c};display:inline-block;"></span>
        <strong style="color:${c};">${p}</strong><span style="color:#4B5563;margin-left:3px;">${l}</span>
      </div>`).join("")}
    </div>
    ${actionItems.length > 0 ? `
    <table class="action">
      <thead><tr><th>Ref</th><th>Action Required</th><th>Priority</th><th>Responsible</th><th>Target Date</th><th>Status</th></tr></thead>
      <tbody>${actionItems.map(item => `
        <tr class="no-break">
          <td style="font-family:'JetBrains Mono',monospace;font-size:7.5pt;color:#9CA3AF;white-space:nowrap;">${item.ref}</td>
          <td>${item.action?.slice(0,120)||item.text?.slice(0,100)||"—"}${(item.action?.length>120||(!item.action&&(item.text?.length||0)>100))?"…":""}</td>
          <td style="white-space:nowrap;"><span style="font-size:8pt;font-weight:700;color:${pColor(item.priority)};">${item.priority?.split(" — ")[0]||"P3"}</span></td>
          <td style="font-size:8.5pt;">${item.responsible||"—"}</td>
          <td style="font-size:8.5pt;white-space:nowrap;color:${item.priority?.includes("P1")?"#B91C1C":"#374151"};">${item.targetDate?fmtDate(item.targetDate):"—"}</td>
          <td><span style="font-size:7pt;font-weight:700;padding:1px 6px;border-radius:6px;background:#F3F4F6;color:#6B7280;text-transform:capitalize;">${item.actionStatus||"Pending"}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>` : `<p class="body" style="font-style:italic;color:#9CA3AF;">No actions recorded.</p>`}
  </div>
  <div class="pg-ftr"><span class="pg-fl">© ${new Date().getFullYear()} ${org.name||"Assessor"} · Confidential</span><span style="font-size:7pt;font-weight:700;color:${pr};">Firesite™</span><span class="pg-fl">Page 5 of 7</span></div>
</div>

<!-- ══ PAGE 6: DECLARATION ════════════════════════════════════════ -->
<div class="page">
  <div class="pg-hdr">
    <div><span class="pg-hdr-brand">${org.name||"Assessor"}</span><span class="pg-hdr-doc">Fire Risk Assessment</span></div>
    <span class="pg-hdr-ref">${a.ref}</span>
  </div>
  <div class="pg-body" style="padding-bottom:48px;">
    <div class="sec-h"><div class="sec-n">H</div><div><div class="sec-l">Section H</div><div class="sec-t">Assessor Declaration</div></div></div>
    <p class="body">I confirm that this fire risk assessment has been carried out to the best of my ability and professional competence, in accordance with the Regulatory Reform (Fire Safety) Order 2005, the Fire Safety Act 2021 and relevant British Standards and guidance documents. This assessment does not guarantee that the premises are entirely free from fire risk and should be reviewed regularly or following any material change to the premises, its use or occupancy.</p>
    ${org.disclaimer ? `<p class="body" style="font-style:italic;color:#6B7280;">${org.disclaimer}</p>` : ""}
    ${org.reportFooter ? `<p class="body" style="color:#9CA3AF;font-size:8.5pt;">${org.reportFooter}</p>` : ""}

    <div class="sig-card">
      <div class="sig-head">Assessor Signature</div>
      <div class="sig-body">
        <div class="sig-f"><div class="sig-l">Assessor Name</div><div class="sig-v">${org.assessor||"—"}${org.quals?" "+org.quals:""}</div></div>
        <div class="sig-f"><div class="sig-l">Organisation</div><div class="sig-v">${org.name||"—"}</div></div>
        <div class="sig-f"><div class="sig-l">Signature</div><div class="sig-c" style="font-family:Georgia,serif;font-size:14pt;letter-spacing:3px;color:#1C1C1C;font-style:italic;">${org.assessor?.split(" ").map(w=>w[0]).join("")||"—"}</div></div>
        <div class="sig-f"><div class="sig-l">Date Signed</div><div class="sig-v">${a.completedAt||fmtDate(new Date().toISOString())}</div></div>
      </div>
    </div>

    <div class="sig-card">
      <div class="sig-head">Responsible Person Acknowledgement</div>
      <div class="sig-body">
        <div class="sig-f"><div class="sig-l">Name</div><div class="sig-v">${a.rpName||"—"}</div></div>
        <div class="sig-f"><div class="sig-l">Title</div><div class="sig-v">${a.rpTitle||"—"}</div></div>
        <div class="sig-f"><div class="sig-l">Signature</div><div class="sig-c">Awaiting signature</div></div>
        <div class="sig-f"><div class="sig-l">Date</div><div class="sig-v" style="color:#9CA3AF;border-color:#D1D5DB;">—</div></div>
      </div>
    </div>
  </div>
  <div class="pg-ftr"><span class="pg-fl">© ${new Date().getFullYear()} ${org.name||"Assessor"} · Confidential</span><span style="font-size:7pt;font-weight:700;color:${pr};">Firesite™</span><span class="pg-fl">Page 6 of 7</span></div>
</div>

<!-- ══ PAGE 7: PHOTO APPENDIX ════════════════════════════════════ -->
<div class="page">
  <div class="pg-hdr">
    <div><span class="pg-hdr-brand">${org.name||"Assessor"}</span><span class="pg-hdr-doc">Fire Risk Assessment</span></div>
    <span class="pg-hdr-ref">${a.ref}</span>
  </div>
  <div class="pg-body" style="padding-bottom:48px;">
    <div class="sec-h"><div class="sec-n">I</div><div><div class="sec-l">Appendix</div><div class="sec-t">Photo Evidence</div></div></div>
    ${allPhotos.length > 0 ? `
    <p class="body">${allPhotos.length} photograph${allPhotos.length!==1?"s were":"was"} recorded during this assessment. Each image is referenced to the relevant question number.</p>
    <div class="photo-grid">
      ${allPhotos.map((p,i) => `
      <div class="photo-item no-break">
        ${photoImg(p, 160, 120)}
        <div class="photo-item-ref">${p.ref} · Photo ${i+1}</div>
        <div class="photo-item-cap">${p.caption||p.questionText?.slice(0,60)||"Reference "+p.ref}</div>
      </div>`).join("")}
    </div>` : `
    <div style="text-align:center;padding:40px 20px;color:#9CA3AF;">
      <div style="font-size:32px;margin-bottom:10px;opacity:.3;">📷</div>
      <div style="font-family:'Nunito',sans-serif;font-size:16pt;color:#6B7280;margin-bottom:6px;">No photos recorded</div>
      <div style="font-size:9pt;">Add photos to questions during the assessment to populate this appendix.</div>
    </div>`}
  </div>
  <div class="pg-ftr"><span class="pg-fl">© ${new Date().getFullYear()} ${org.name||"Assessor"} · Confidential</span><span style="font-size:7pt;font-weight:700;color:${pr};">Firesite™</span><span class="pg-fl">Page 7 of 7</span></div>
</div>

</body>
</html>`;

  // Open print window
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Please allow pop-ups for this site to generate the PDF, then try again.");
    return;
  }
  win.document.write(html);
  win.document.close();

  // Wait for fonts and images to load before printing
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 800);
  };
}

function CompleteScreen({state, dispatch}) {
  const a = state.assessments.find(x=>x.id===state.activeId);
  if (!a) return null;

  const {org} = state;
  const ac = org.accentColor||"#0D7A7A";
  const pr = org.primaryColor||"#0D1117";
  const [tab, setTab] = useState("overview");

  const answers  = a.answers||{};
  const answered = Object.values(answers).filter(v=>v&&(v.ans||(v.sel&&v.sel.length>0))).length;
  const flagged  = Object.values(answers).filter(v=>v?.flagged).length;
  const firstName= org.assessor?.split(" ")[0]||null;
  const risk     = a.riskRating||"";

  // All flagged action items with photos
  const actionItems = Object.entries(answers)
    .filter(([,v])=>v?.flagged)
    .map(([ref,v])=>{
      const q = FRA_SECTIONS.flatMap(s=>s.questions).find(q=>q.ref===ref);
      return {ref, text:q?.q, action:v.action, priority:v.priority||"P3 — Within 3 months",
              responsible:v.responsible, targetDate:v.targetDate,
              actionStatus:v.actionStatus||"pending", photos:v.photos||[], note:v.note||""};
    });

  // All photos across the whole assessment
  const allPhotos = Object.entries(answers).flatMap(([ref,v])=>
    (v?.photos||[]).map(p=>({...p, ref, questionText:FRA_SECTIONS.flatMap(s=>s.questions).find(q=>q.ref===ref)?.q||""}))
  );

  // Report header component
  const RHdr = () => (
    <div style={{background:pr,padding:"7px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {org.logo&&<img src={org.logo} style={{height:20,objectFit:"contain"}} alt=""/>}
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:"#fff"}}>{org.name||"Assessor"}</span>
        <span style={{width:1,height:10,background:"rgba(255,255,255,.15)",display:"inline-block",marginLeft:6}}/>
        <span style={{fontSize:8,color:ac,fontWeight:600}}>Fire Risk Assessment Report</span>
      </div>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,.2)"}}>{a.ref}</span>
    </div>
  );

  const RFtr = ({pg,tot=7}) => (
    <div className="rpt-nav" style={{borderTop:"1px solid #EAECF0",background:"#F9FAFB"}}>
      <span className="rpt-fl">© {new Date().getFullYear()} {org.name||"Assessor"} · Confidential</span>
      <span style={{fontSize:8,fontWeight:700,color:pr}}>Firesite™ by Bluejai</span>
      <span className="rpt-fl">Page {pg} of {tot}</span>
    </div>
  );

  const RSecHead = ({n, label, title}) => (
    <div className="rpt-sh">
      <div className="rpt-sn">{n}</div>
      <div><div className="rpt-sl" style={{color:ac}}>{label}</div><div className="rpt-st">{title}</div></div>
    </div>
  );

  return (
    <div className="complete-wrap">

      {/* Sticky nav */}
      <div className="tnav dk" style={{background:pr,position:"sticky",top:0,zIndex:100}}>
        <button className="tn-back" onClick={()=>dispatch({type:"GO",screen:"dashboard"})}>← Back</button>
        <div className="tn-mid">
          <div className="tn-title dk" style={{fontSize:12}}>{a.premisesName||"Assessment"} — Complete</div>
          <div className="tn-sub">{a.ref}</div>
        </div>
      </div>

      {/* Completion hero */}
      <div style={{background:`linear-gradient(135deg,${pr} 0%,${pr}DD 100%)`,padding:"24px 16px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:-30,right:-30,width:120,height:120,borderRadius:"50%",border:"20px solid rgba(255,255,255,.05)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{fontSize:44}} className="pop">🏆</div>
          <div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:24,fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:3}}>
              {firstName?`Complete, ${firstName}!`:"Assessment complete!"}
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>
              {answered} answered · {flagged} flagged · {a.completedAt||"Just now"}
            </div>
          </div>
        </div>
        {risk && (
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.08)",borderRadius:8,padding:"8px 14px"}}>
            <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"rgba(255,255,255,.4)"}}>Risk Rating</span>
            <span style={{fontFamily:"'Nunito',sans-serif",fontSize:18,fontWeight:700,color:riskCol(risk)}}>{risk.split("—")[0].trim()}</span>
          </div>
        )}
        {state.assessments.filter(x=>x.status==="complete").length>1 && (
          <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:5,background:`${ac}22`,border:`1px solid ${ac}44`,borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:600,color:ac}}>
            🔥 {state.assessments.filter(x=>x.status==="complete").length} assessments completed
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="tab-nav" style={{background:"#fff",borderBottom:"1px solid #EAECF0",top:50}}>
        {[["overview","📊 Overview"],["actions","⚑ Actions"],["report","📄 Report"]].map(([k,l])=>(
          <button key={k} className="tnb" onClick={()=>setTab(k)} style={{
            background:tab===k?pr:"transparent",
            color:tab===k?"#fff":"#6B7280",
            fontWeight:tab===k?600:400,
          }}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab==="overview" && (
        <div style={{padding:"16px"}}>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[
              {v:answered,l:"Answered",col:"#059669",bg:"#ECFDF5"},
              {v:flagged,l:"Flagged",col:ac,bg:"#FDF3EE"},
              {v:FRA_SECTIONS.length,l:"Assessment sections",col:pr,bg:"#F8F9FC"},
            ].map((s,i)=>(
              <div key={i} style={{background:s.bg,border:`1px solid ${s.col}22`,borderRadius:9,padding:"12px 10px",textAlign:"center"}}>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:26,fontWeight:700,color:s.col,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:9,color:"#9CA3AF",marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card" style={{marginBottom:12}}>
            <div className="ch"><div className="ct">Assessment Summary</div></div>
            <div className="cb">
              {[
                ["Premises",a.premisesName+(a.premisesAddress?"\n"+a.premisesAddress:"")],
                ["Client",a.clientName||"—"],
                ["Responsible Person",(a.rpName||"—")+(a.rpTitle?", "+a.rpTitle:"")],
                ["Assessor",(org.assessor||"—")+(org.quals?" "+org.quals:"")],
                ["Date",fmtDate(a.assessmentDate)],
                ["Risk Rating",risk||"Not set"],
                ["Next Review",a.nextReview||"—"],
                ["Photos taken",allPhotos.length+" photo"+(allPhotos.length!==1?"s":"")],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",padding:"7px 0",borderBottom:"1px solid #F9FAFB",gap:10}}>
                  <span style={{width:100,flexShrink:0,fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.4,color:"#9CA3AF",paddingTop:2}}>{l}</span>
                  <span style={{fontSize:12,color:"#2D2D2D",flex:1,whiteSpace:"pre-line",lineHeight:1.5}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section dots */}
          <div className="card" style={{marginBottom:14}}>
            <div className="ch"><div className="ct">Section Completion</div></div>
            <div className="cb">
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {FRA_SECTIONS.map((s,i)=>{
                  const done = s.questions.filter(q=>q.required).every(q=>isAnswered(q,answers[q.ref]||{}));
                  return (
                    <div key={i} title={s.title}
                      onClick={()=>{dispatch({type:"SET_ACTIVE",id:a.id,screen:"assessment"});dispatch({type:"SEC",i});}}
                      style={{cursor:"pointer",display:"flex",alignItems:"center",gap:4,background:done?"#ECFDF5":"#F3F4F6",border:`1px solid ${done?"#6EE7B7":"#EAECF0"}`,color:done?"#7B1C1C":"#9CA3AF",borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:done?600:400}}>
                      {done?"✓":i+1} {s.short||s.title.split(" ")[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Photo strip preview */}
          {allPhotos.length>0 && (
            <div className="card" style={{marginBottom:14}}>
              <div className="ch">
                <div className="ct">Photo Evidence</div>
                <span style={{fontSize:11,color:ac,fontWeight:600}}>{allPhotos.length} photo{allPhotos.length!==1?"s":""}</span>
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",gap:6,overflow:"hidden",flexWrap:"wrap"}}>
                  {allPhotos.slice(0,8).map((p,i)=>(
                    <div key={i} style={{position:"relative",width:60,height:60,borderRadius:6,overflow:"hidden",border:"1px solid #EAECF0",flexShrink:0}}>
                      <img src={p.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.65))",padding:"2px 4px"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:"rgba(255,255,255,.8)"}}>{p.ref}</div>
                      </div>
                    </div>
                  ))}
                  {allPhotos.length>8&&<div style={{width:60,height:60,borderRadius:6,background:"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#9CA3AF",fontWeight:600}}>+{allPhotos.length-8}</div>}
                </div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:8}}>Photos appear in report findings and Photo Evidence Appendix (Page 7)</div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button className="btn btn-dark btn-full" style={{background:pr,padding:13,fontSize:13,fontWeight:700,borderRadius:9}} onClick={()=>setTab("report")}>
              📄 Preview & Generate Report
            </button>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="btn btn-ghost btn-full" style={{padding:10}} onClick={()=>setTab("actions")}>⚑ Action Plan</button>
              <button className="btn btn-ghost btn-full" style={{padding:10}} onClick={()=>dispatch({type:"SET_ACTIVE",id:a.id,screen:"assessment"})}>← Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIONS TAB ── */}
      {tab==="actions" && (
        <div style={{padding:"16px"}}>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:20,fontWeight:700,color:"#1C1C1C",marginBottom:3}}>Action Plan</div>
            <div style={{fontSize:11,color:"#9CA3AF"}}>{actionItems.length} item{actionItems.length!==1?"s":""} — update status as actions are resolved</div>
          </div>

          {actionItems.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#9CA3AF"}}>
              <div style={{fontSize:32,marginBottom:10,opacity:.3}}>⚑</div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:17,marginBottom:5,color:"#6B7280"}}>No items flagged</div>
              <div style={{fontSize:12}}>Flag questions during the assessment to build your action plan</div>
            </div>
          ) : (
            <div className="card">
              <div style={{padding:"0 14px"}}>
                {actionItems.map((ac2,i)=>(
                  <div key={i} className="act-item">
                    <div className="act-pdot" style={{background:pColor(ac2.priority)}}/>
                    <div className="act-body">
                      <div className="act-text">{ac2.action||ac2.text?.slice(0,120)||"No action description"}</div>
                      <div className="act-tags">
                        <span className="act-tag">{ac2.ref}</span>
                        {ac2.priority&&<span className="act-tag" style={{color:pColor(ac2.priority),background:pBg(ac2.priority)}}>{ac2.priority.split(" — ")[0]}</span>}
                        {ac2.responsible&&<span className="act-tag">{ac2.responsible}</span>}
                        {ac2.targetDate&&<span className="act-tag">Due: {fmtDate(ac2.targetDate)}</span>}
                        {ac2.photos.length>0&&<span className="act-tag">📷 {ac2.photos.length}</span>}
                      </div>
                      {/* Photos on action item */}
                      {ac2.photos.length>0&&(
                        <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                          {ac2.photos.map((p,j)=>(
                            <div key={j} style={{position:"relative",width:48,height:48,borderRadius:5,overflow:"hidden",border:"1px solid #EAECF0"}}>
                              <img src={p.src} alt={p.caption} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <select className="act-ssel"
                      value={ac2.actionStatus}
                      onChange={e=>dispatch({type:"UPDATE_ACTION",ref:ac2.ref,status:e.target.value})}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="complete">Complete ✓</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REPORT TAB ── */}
      {tab==="report" && (
        <div>
          <div style={{padding:"12px 16px",background:"#fff",borderBottom:"1px solid #EAECF0",display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700}}>Report Preview</div>
              <div style={{fontSize:10,color:"#9CA3AF"}}>Your branded report — {actionItems.length} findings, {allPhotos.length} photos, {7} pages</div>
            </div>
            <button className="btn btn-dark btn-sm" style={{background:pr,flexShrink:0}}
              onClick={()=>generatePDF(a, org)}>
              ⬇ PDF
            </button>
            <button className="btn btn-ghost btn-sm" style={{flexShrink:0}}
              onClick={()=>alert(`Email report to ${a.clientEmail||"client"}`)}>
              📧
            </button>
          </div>

          <div className="rpt-wrap">

            {/* PAGE 1 — COVER */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 1 of 7 — Cover</div>
            <div className="rpt-page">
              <div style={{background:pr,padding:"24px 16px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",bottom:-28,right:-28,width:110,height:110,borderRadius:"50%",border:"18px solid rgba(255,255,255,.05)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:24,position:"relative"}}>
                  {org.logo?<img src={org.logo} style={{height:30,objectFit:"contain",borderRadius:3}} alt=""/>:
                    <div style={{width:30,height:30,borderRadius:5,background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}><img src={_IMG0} style={{width:"100%",height:"100%",objectFit:"contain",display:"block",padding:"1px"}}/></div>}
                  <div>
                    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#fff"}}>{org.name||"Assessor"}</div>
                    {org.assessor&&<div style={{fontSize:8,color:"rgba(255,255,255,.38)",marginTop:1}}>{org.assessor}{org.quals?` · ${org.quals}`:""}</div>}
                  </div>
                </div>
                <div style={{width:28,height:2,background:ac,marginBottom:9,position:"relative"}}/>
                <div style={{fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:ac,marginBottom:6,position:"relative"}}>Fire Risk Assessment Report</div>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:20,fontWeight:700,color:"#fff",lineHeight:1.15,position:"relative"}}>
                  {a.premisesName||"Premises Name"}<br/>
                  <span style={{fontSize:13,opacity:.55}}>{a.premisesAddress||"Address not set"}</span>
                </div>
              </div>
              <div style={{height:2,background:`linear-gradient(90deg,${ac},transparent)`}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                {[["Reference",a.ref],["Date",fmtDate(a.assessmentDate)],
                  ["Risk Rating",(risk||"Not set").split("—")[0].trim()],["Next Review",a.nextReview||"—"],
                  ["Resp. Person",(a.rpName||"—")+(a.rpTitle?"\n"+a.rpTitle:"")],["Client",a.clientName||"—"]].map(([l,v])=>(
                  <div key={l} style={{padding:"8px 12px",borderRight:"1px solid #F3F4F6",borderBottom:"1px solid #F3F4F6"}}>
                    <div style={{fontSize:6,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:"#9CA3AF",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:10,fontWeight:600,color:l==="Risk Rating"?riskCol(risk):"#0D1117",whiteSpace:"pre-line",lineHeight:1.3}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"5px 12px",background:"#F9FAFB",display:"flex",justifyContent:"space-between",borderTop:"1px solid #EAECF0"}}>
                <span style={{fontSize:8,color:"#9CA3AF"}}>Prepared by: {org.assessor||"Assessor"}{org.quals?` · ${org.quals}`:""}</span>
                <span style={{fontSize:8,fontWeight:700,color:pr}}>Firesite™ by Bluejai</span>
              </div>
              <RFtr pg={1}/>
            </div>

            {/* PAGE 2 — PREMISES */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 2 of 7 — Premises & Introduction</div>
            <div className="rpt-page">
              <RHdr/>
              <div className="rpt-body">
                <RSecHead n="A" label="Section A" title="Premises & General Information"/>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,marginBottom:14}}>
                  <tbody>
                    {[["Client",a.clientName||"—"],["Contact",a.clientContact||"—"],["Address",a.premisesAddress||"—"],
                      ["Type",a.premisesType||"—"],["Responsible Person",(a.rpName||"—")+(a.rpTitle?", "+a.rpTitle:"")],
                      ["Lead Assessor",(org.assessor||"—")+(org.quals?" "+org.quals:"")],
                      ["Assessment Type",org.assessType||"Type 1 — Non-Intrusive"],
                      ["Date",fmtDate(a.assessmentDate)],
                      ["Legislation","Regulatory Reform (Fire Safety) Order 2005 · Fire Safety Act 2021"]
                    ].map(([l,v])=>(
                      <tr key={l}>
                        <td style={{width:100,fontWeight:700,fontSize:8,textTransform:"uppercase",color:"#9CA3AF",padding:"5px 0",borderBottom:"1px solid #F3F4F6",verticalAlign:"top"}}>{l}</td>
                        <td style={{padding:"5px 0 5px 8px",borderBottom:"1px solid #F3F4F6",color:"#2D2D2D",lineHeight:1.5}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <RSecHead n="B" label="Section B" title="Introduction & Scope"/>
                <p className="rpt-p">This fire risk assessment has been carried out by a competent assessor to assist the Responsible Person in meeting their duties under Article 9 of the Regulatory Reform (Fire Safety) Order 2005. The assessment is a {org.assessType||"Type 1 — Non-Intrusive"} examination of the premises and fire safety management arrangements in place at the time of inspection.</p>
                <p className="rpt-p">This report identifies potential fire hazards to life safety, evaluates the adequacy of existing fire precautions and makes recommendations where deficiencies are identified.</p>
                {org.disclaimer&&<p className="rpt-p" style={{fontStyle:"italic",color:"#6B7280"}}>{org.disclaimer}</p>}
                <RSecHead n="C" label="Executive Summary" title="Executive Summary"/>
                <p className="rpt-p">{
                  (() => {
                    const ratingText = risk ? risk.split("—")[0].trim() : "unrated";
                    const flagCount  = actionItems.length;
                    const p1count    = actionItems.filter(x=>x.priority?.includes("P1")).length;
                    const secsDone   = FRA_SECTIONS.filter(s=>s.questions.filter(q=>q.required).every(q=>isAnswered(q,(a.answers||{})[q.ref]||{}))).length;
                    const positives  = Object.entries(a.answers||{}).filter(([,v])=>v?.ans==="y"&&v?.note).length;
                    return `This fire risk assessment was carried out at ${a.premisesName||"the premises"} on ${fmtDate(a.assessmentDate)} by ${org.assessor||"the assessor"}${org.quals?" ("+org.quals+")":""}. The assessment covered ${secsDone} of ${FRA_SECTIONS.length} sections of the standard fire risk assessment framework in accordance with the Regulatory Reform (Fire Safety) Order 2005. ` +
                      `The overall fire risk rating assigned to these premises is ${ratingText}. A total of ${flagCount} significant finding${flagCount!==1?"s were":"was"} identified during the assessment` +
                      (p1count>0 ? `, of which ${p1count} require${p1count===1?"s":""} immediate action` : "") +
                      `. ${positives>0?"A number of positive fire safety management arrangements were also noted. ":""}The Responsible Person is advised to implement all recommended actions within the timescales specified in the Action Plan.`;
                  })()
                }</p>
              </div>
              <RFtr pg={2}/>
            </div>

            {/* PAGE 3 — RISK EVALUATION */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 3 of 7 — Risk Evaluation</div>
            <div className="rpt-page">
              <RHdr/>
              <div className="rpt-body">
                <RSecHead n="C" label="Section C" title="Risk Evaluation"/>
                {risk ? (
                  <div style={{background:riskBg(risk),border:`1px solid ${riskCol(risk)}33`,borderRadius:8,padding:"13px 14px",display:"flex",gap:11,alignItems:"flex-start",marginBottom:13}}>
                    <span style={{fontSize:26,flexShrink:0}}>⚠️</span>
                    <div>
                      <div style={{fontFamily:"'Nunito',sans-serif",fontSize:19,fontWeight:700,color:riskCol(risk),marginBottom:3}}>{risk.split("—")[0].trim()}</div>
                      <div style={{fontSize:9,color:"#2D2D2D",lineHeight:1.6}}>{answers["OR.1"]?.ans||""}{answers["OR.2"]?.ans?" · "+answers["OR.2"].ans:""}</div>
                      <div style={{fontSize:9,color:"#6B7280",marginTop:3}}>{risk.split("—").slice(1).join("—").trim()}</div>
                    </div>
                  </div>
                ):<p className="rpt-p">Risk rating not set — complete Section 12.</p>}
                {/* Risk matrix */}
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#9CA3AF",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:.8}}>Risk Matrix</div>
                <div style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 1fr",border:"1px solid #EAECF0",borderRadius:6,overflow:"hidden",fontSize:9,marginBottom:12}}>
                  {["","Slight Harm","Moderate Harm","Extreme Harm"].map((h,i)=>(
                    <div key={i} style={{padding:"5px 6px",background:"#F9FAFB",borderBottom:"1px solid #EAECF0",borderLeft:i>0?"1px solid #EAECF0":"none",fontWeight:700,fontSize:7,textTransform:"uppercase",color:"#6B7280",textAlign:i===0?"left":"center"}}>{h}</div>
                  ))}
                  {[["Low","#ECFDF5","#7B1C1C","#FFFBEB","#92400E","#FEF3C7","#B45309"],
                    ["Medium","#FFFBEB","#92400E","#FEF3C7","#B45309","#FEF2F2","#991B1B"],
                    ["High","#FEF3C7","#B45309","#FEF2F2","#991B1B","#7B1C1C","#FECACA"]].map(([l,...cs])=>[
                    <div key={l} style={{padding:"7px 6px",background:"#F9FAFB",borderTop:"1px solid #EAECF0",fontSize:8,fontWeight:700,textTransform:"uppercase",color:"#6B7280"}}>{l}</div>,
                    ...[0,1,2].map(i=>(
                      <div key={i} style={{padding:"7px",textAlign:"center",fontWeight:700,fontSize:9,background:cs[i*2],color:cs[i*2+1],borderLeft:"1px solid #EAECF0",borderTop:"1px solid #EAECF0"}}>
                        {[["Trivial","Tolerable","Moderate"],["Tolerable","Moderate","Substantial"],["Moderate","Substantial","Intolerable"]][["Low","Medium","High"].indexOf(l)][i]}
                      </div>
                    ))
                  ])}
                </div>
              </div>
              <RFtr pg={3}/>
            </div>

            {/* PAGE 4 — FINDINGS WITH PHOTOS */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 4 of 7 — Significant Findings</div>
            <div className="rpt-page">
              <RHdr/>
              <div className="rpt-body">
                <RSecHead n="D" label="Section D" title="Significant Findings"/>
                <p className="rpt-p">The following significant findings were identified during the assessment. Each finding is cross-referenced to the Action Plan in Section E. Photographic evidence is shown below each relevant finding.</p>
                {actionItems.length>0 ? actionItems.map((item,i)=>(
                  <div key={i} className="rpt-finding">
                    <div className="rpt-f-head">
                      <span className="rpt-f-ref">{item.ref}</span>
                      <span className="rpt-f-text">{item.text?.slice(0,150)||item.action}</span>
                      <span className="rpt-f-pri" style={{background:pBg(item.priority),color:pColor(item.priority)}}>{item.priority?.split(" — ")[0]||"P3"}</span>
                    </div>
                    {item.action&&<div style={{marginLeft:22,fontSize:9,color:"#6B7280",fontStyle:"italic",marginBottom:5,lineHeight:1.5}}>Action: {item.action.slice(0,200)}{item.action.length>200?"…":""}</div>}
                    {/* PHOTOS EMBEDDED IN FINDINGS */}
                    {item.photos.length>0 && (
                      <div className="rpt-f-photos">
                        {item.photos.map((p,j)=>(
                          <div key={j} className="rpt-f-photo">
                            <img src={p.src} alt={p.caption}/>
                            <div className="rpt-f-caption">{p.caption||`Ref ${item.ref} · Photo ${j+1}`}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )) : <p className="rpt-p" style={{color:"#9CA3AF",fontStyle:"italic"}}>No significant findings recorded.</p>}
              </div>
              <RFtr pg={4}/>
            </div>

            {/* PAGE 5 — ACTION PLAN */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 5 of 7 — Action Plan</div>
            <div className="rpt-page">
              <RHdr/>
              <div className="rpt-body">
                {(() => {
                  const positiveFindings = Object.entries(a.answers||{})
                    .filter(([,v])=>v?.ans==="y"&&v?.note&&v.note.trim())
                    .map(([ref,v])=>({ref,note:v.note,q:FRA_SECTIONS.flatMap(s=>s.questions).find(q=>q.ref===ref)?.q}))
                    .slice(0,8);
                  if (positiveFindings.length===0) return null;
                  return (<>
                    <RSecHead n="E" label="Section E" title="Positive Findings"/>
                    <p className="rpt-p">The following positive fire safety arrangements were observed during the assessment.</p>
                    {positiveFindings.map((f,i)=>(
                      <div key={i} style={{padding:"6px 0",borderBottom:"1px solid #F3F4F6",display:"flex",gap:8}}>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#059669",flexShrink:0,marginTop:2}}>✓ {f.ref}</span>
                        <span style={{fontSize:10,color:"#2D2D2D",lineHeight:1.5}}>{f.note}</span>
                      </div>
                    ))}
                  </>);
                })()}
                <RSecHead n="F" label="Section F" title="Action Plan"/>
                <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                  {[["P1","Immediate","#B91C1C"],["P2","1 month","#D97706"],["P3","3 months","#E05A1A"],["P4","12 months","#059669"]].map(([p,l,c])=>(
                    <div key={p} style={{display:"flex",alignItems:"center",gap:3,fontSize:7,padding:"2px 7px",background:`${c}11`,border:`1px solid ${c}22`,borderRadius:8}}>
                      <span style={{width:4,height:4,borderRadius:"50%",background:c,flexShrink:0,display:"inline-block"}}/>
                      <strong style={{color:c}}>{p}</strong><span style={{color:"#4B5563"}}>{l}</span>
                    </div>
                  ))}
                </div>
                {actionItems.length>0 ? (
                  <table className="rpt-tbl">
                    <thead><tr style={{background:pr}}><th>Ref</th><th>Action</th><th>P</th><th>Responsible</th><th>By</th><th>Status</th></tr></thead>
                    <tbody>{actionItems.map((item,i)=>(
                      <tr key={i}>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#9CA3AF",whiteSpace:"nowrap"}}>{item.ref}</td>
                        <td style={{maxWidth:180}}>{item.action?.slice(0,100)||item.text?.slice(0,80)||"—"}{(item.action?.length>100||(!item.action&&item.text?.length>80))?"…":""}</td>
                        <td style={{whiteSpace:"nowrap"}}><span style={{fontSize:8,fontWeight:700,color:pColor(item.priority)}}>{item.priority?.split(" — ")[0]||"P3"}</span></td>
                        <td style={{fontSize:9}}>{item.responsible||"—"}</td>
                        <td style={{fontSize:9,whiteSpace:"nowrap",color:item.priority?.includes("P1")?"#B91C1C":"#374151"}}>{item.targetDate?fmtDate(item.targetDate):"—"}</td>
                        <td><span style={{fontSize:7,fontWeight:700,padding:"1px 5px",borderRadius:6,background:"#F3F4F6",color:"#6B7280",textTransform:"capitalize"}}>{item.actionStatus||"Pending"}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                ):<p className="rpt-p" style={{fontStyle:"italic",color:"#9CA3AF"}}>No actions recorded.</p>}
              </div>
              <RFtr pg={5}/>
            </div>

            {/* PAGE 6 — DECLARATION */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 6 of 7 — Declaration</div>
            <div className="rpt-page">
              <RHdr/>
              <div className="rpt-body">
                <RSecHead n="G" label="Section G" title="Assessor Declaration"/>
                <p className="rpt-p">I confirm that this fire risk assessment has been carried out to the best of my ability and professional competence, in accordance with the Regulatory Reform (Fire Safety) Order 2005, the Fire Safety Act 2021 and relevant British Standards and guidance documents.</p>
                {org.disclaimer&&<p className="rpt-p" style={{fontStyle:"italic",color:"#6B7280"}}>{org.disclaimer}</p>}
                <RSecHead n="C" label="Executive Summary" title="Executive Summary"/>
                <p className="rpt-p">{
                  (() => {
                    const ratingText = risk ? risk.split("—")[0].trim() : "unrated";
                    const flagCount  = actionItems.length;
                    const p1count    = actionItems.filter(x=>x.priority?.includes("P1")).length;
                    const secsDone   = FRA_SECTIONS.filter(s=>s.questions.filter(q=>q.required).every(q=>isAnswered(q,(a.answers||{})[q.ref]||{}))).length;
                    const positives  = Object.entries(a.answers||{}).filter(([,v])=>v?.ans==="y"&&v?.note).length;
                    return `This fire risk assessment was carried out at ${a.premisesName||"the premises"} on ${fmtDate(a.assessmentDate)} by ${org.assessor||"the assessor"}${org.quals?" ("+org.quals+")":""}. The assessment covered ${secsDone} of ${FRA_SECTIONS.length} sections of the standard fire risk assessment framework in accordance with the Regulatory Reform (Fire Safety) Order 2005. ` +
                      `The overall fire risk rating assigned to these premises is ${ratingText}. A total of ${flagCount} significant finding${flagCount!==1?"s were":"was"} identified during the assessment` +
                      (p1count>0 ? `, of which ${p1count} require${p1count===1?"s":""} immediate action` : "") +
                      `. ${positives>0?"A number of positive fire safety management arrangements were also noted. ":""}The Responsible Person is advised to implement all recommended actions within the timescales specified in the Action Plan.`;
                  })()
                }</p>
                {org.reportFooter&&<p className="rpt-p" style={{color:"#9CA3AF",fontSize:9}}>{org.reportFooter}</p>}
                <div className="sig-card">
                  <div className="sig-head">Assessor Signature</div>
                  <div className="sig-body">
                    <div className="sig-f"><div className="sig-l">Name</div><div className="sig-v">{org.assessor||"—"}{org.quals?" "+org.quals:""}</div></div>
                    <div className="sig-f"><div className="sig-l">Organisation</div><div className="sig-v">{org.name||"—"}</div></div>
                    <div className="sig-f"><div className="sig-l">Signature</div><div className="sig-c" style={{fontFamily:"Georgia,serif",fontSize:13,letterSpacing:2,color:"#1C1C1C",fontStyle:"italic"}}>{org.assessor?.split(" ").map(w=>w[0]).join("")||"—"}</div></div>
                    <div className="sig-f"><div className="sig-l">Date</div><div className="sig-v">{a.completedAt||fmtDate(new Date().toISOString())}</div></div>
                  </div>
                </div>
                <div className="sig-card">
                  <div className="sig-head">Responsible Person Acknowledgement</div>
                  <div className="sig-body">
                    <div className="sig-f"><div className="sig-l">Name</div><div className="sig-v">{a.rpName||"—"}</div></div>
                    <div className="sig-f"><div className="sig-l">Title</div><div className="sig-v">{a.rpTitle||"—"}</div></div>
                    <div className="sig-f"><div className="sig-l">Signature</div><div className="sig-c">Awaiting signature</div></div>
                    <div className="sig-f"><div className="sig-l">Date</div><div className="sig-v" style={{color:"#9CA3AF",borderColor:"#D1D5DB"}}>—</div></div>
                  </div>
                </div>
              </div>
              <RFtr pg={6}/>
            </div>

            {/* PAGE 7 — PHOTO EVIDENCE APPENDIX */}
            <div style={{textAlign:"center",fontSize:8,color:"#94A3B8",marginBottom:5,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Page 7 of 7 — Photo Evidence Appendix</div>
            <div className="rpt-page">
              <RHdr/>
              <div className="rpt-body">
                <RSecHead n="H" label="Appendix" title="Photo Evidence"/>
                {allPhotos.length>0 ? (
                  <>
                    <p className="rpt-p">{allPhotos.length} photograph{allPhotos.length!==1?"s were":"was"} recorded during this assessment. Each image is referenced to the relevant question number.</p>
                    <div className="app-grid">
                      {allPhotos.map((p,i)=>(
                        <div key={i} className="app-item">
                          <img src={p.src} alt={p.caption||`Photo ${i+1}`}/>
                          <div className="app-ref">{p.ref} · Photo {i+1}</div>
                          <div className="app-cap">{p.caption||p.questionText?.slice(0,50)||`Reference ${p.ref}`}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{textAlign:"center",padding:"30px 20px",color:"#9CA3AF"}}>
                    <div style={{fontSize:28,marginBottom:8,opacity:.3}}>📷</div>
                    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:15,color:"#6B7280",marginBottom:5}}>No photos recorded</div>
                    <div style={{fontSize:11}}>Add photos to questions during the assessment to populate this appendix. Photos appear both here and inline within the relevant finding in Section D.</div>
                  </div>
                )}
              </div>
              <RFtr pg={7}/>
            </div>

          </div>{/* /rpt-wrap */}

          <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
            <button className="btn btn-dark btn-full" style={{background:pr,padding:13,fontSize:13,fontWeight:700,borderRadius:9}}
              onClick={()=>generatePDF(a, org)}>
              ⬇ Download PDF Report
            </button>
            <button className="btn btn-ghost btn-full" style={{padding:11}}
              onClick={()=>alert(`Email report to ${a.clientEmail||"client email not set"}`)}>
              📧 Email to Client
            </button>
          </div>

        </div>
      )}{/* /report tab */}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────

// ─── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, INIT);

  // Online/offline detection
  useEffect(() => {
    const setOnline  = () => dispatch({type:"SET_ONLINE",v:true});
    const setOffline = () => dispatch({type:"SET_ONLINE",v:false});
    window.addEventListener("online",  setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online",  setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  // localStorage persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("firesite_v4n");
      if (saved) dispatch({type:"HYDRATE", state:{...INIT,...JSON.parse(saved)}});
    } catch(e){}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("firesite_v4n", JSON.stringify(state)); }
    catch(e){}
  }, [state]);

  const {screen} = state;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      {screen==="landing"      && <Landing      dispatch={dispatch}/>}
      {screen==="setup"        && <Setup         state={state} dispatch={dispatch}/>}
      {screen==="dashboard"    && <Dashboard     state={state} dispatch={dispatch}/>}
      {screen==="client-setup" && <ClientSetup   state={state} dispatch={dispatch}/>}
      {screen==="assessment"   && <Assessment     state={state} dispatch={dispatch}/>}
      {screen==="complete"     && <CompleteScreen state={state} dispatch={dispatch}/>}
    </>
  );
}
