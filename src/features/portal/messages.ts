export function directCounterpartId(currentUserId: string, participantUserIds: string[], allowedCounterpartIds: ReadonlySet<string>) {
  if (participantUserIds.length !== 2 || !participantUserIds.includes(currentUserId)) return null;
  const counterpartId = participantUserIds.find((userId) => userId !== currentUserId);
  return counterpartId && allowedCounterpartIds.has(counterpartId) ? counterpartId : null;
}
