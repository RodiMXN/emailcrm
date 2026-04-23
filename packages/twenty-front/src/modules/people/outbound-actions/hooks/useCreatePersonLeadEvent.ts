import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import {
  type PersonOutboundManualAction,
  type PersonOutboundStateSnapshot,
} from '@/people/outbound-actions/types/PersonOutboundManualAction';
import { buildPersonLeadEventNoteInput } from '@/people/outbound-actions/utils/buildPersonLeadEventNoteInput';

export const useCreatePersonLeadEvent = ({ recordId }: { recordId: string }) => {
  const { createOneRecord: createOneNote } = useCreateOneRecord({
    objectNameSingular: 'note',
    shouldMatchRootQueryFilter: true,
  });

  const { createOneRecord: createOneNoteTarget } = useCreateOneRecord({
    objectNameSingular: 'noteTarget',
    shouldMatchRootQueryFilter: true,
  });

  const createPersonLeadEvent = async ({
    action,
    afterSnapshot,
  }: {
    action: PersonOutboundManualAction;
    afterSnapshot: PersonOutboundStateSnapshot;
  }) => {
    const noteInput = buildPersonLeadEventNoteInput({
      action,
      afterSnapshot,
    });

    const createdNote = await createOneNote({
      title: noteInput.title,
      bodyV2: noteInput.bodyV2,
      position: 'last',
    });

    await createOneNoteTarget({
      noteId: createdNote.id,
      targetPersonId: recordId,
    });
  };

  return {
    createPersonLeadEvent,
  };
};
