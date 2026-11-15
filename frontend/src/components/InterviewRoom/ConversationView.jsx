import { ConversationState } from "../../utils/constants";

import AiSpeakingView from "./AiSpeakingView";
import ListeningView from "./ListeningView";
import CompletedView from "./CompletedView";
import ErrorView from "./ErrorView";
import ConnectingView from "./ConnectingView";
import ProcessingView from "./ProcessingView";

const VIEWS = {
  [ConversationState.CONNECTING]: ConnectingView,
  [ConversationState.AI_SPEAKING]: AiSpeakingView,
  [ConversationState.LISTENING]: ListeningView,
  [ConversationState.CANDIDATE_SPEAKING]: ListeningView,
  [ConversationState.PROCESSING]: ProcessingView,
  [ConversationState.COMPLETED]: CompletedView,
  [ConversationState.ERROR]: ErrorView,
};

export default function ConversationView({ state, ...viewProps }) {
  const View = VIEWS[state];

  return (
    <div className="my-auto flex flex-col items-center text-center">
      {View && <View {...viewProps} />}
    </div>
  );
}
