import { createCommand } from '#base';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  DiscordAPIError,
  GuildMember,
  HTTPError,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  RateLimitError,
} from 'discord.js';

const THIRTY_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_DELAY_MS = 1000; // Delay mínimo entre kicks (1.2 segundos)
const MAX_DELAY_MS = 60000; // Delay máximo (30 segundos)
const INITIAL_DELAY_MS = 1000; // Delay inicial (1.5 segundos)
const DELAY_INCREMENT = 1000; // Incremento quando há rate limit (0.5 segundos)
const DELAY_DECREMENT = 100; // Decremento quando não há rate limit (0.1 segundos)
const RATE_LIMIT_BASE_DELAY = 5000; // 5 segundos base para rate limit

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getRetryAfter(error: unknown): number | null {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000;
  }

  const errorAny = error as any;

  if (error instanceof DiscordAPIError && error.code === 429) {
    if (errorAny.retryAfter) {
      return errorAny.retryAfter * 1000;
    }
    if (errorAny.requestData?.retry_after) {
      return errorAny.requestData.retry_after * 1000;
    }
    if (errorAny.retry_after) {
      return errorAny.retry_after * 1000;
    }
    if (errorAny.rawError?.retry_after) {
      return errorAny.rawError.retry_after * 1000;
    }
  }

  if (error instanceof HTTPError) {
    const headers = errorAny.request?.headers || errorAny.response?.headers;
    if (headers?.['retry-after']) {
      const retryAfter = parseInt(headers['retry-after'], 10);
      if (!isNaN(retryAfter)) {
        return retryAfter * 1000;
      }
    }
  }

  if (errorAny.retry_after) {
    return errorAny.retry_after * 1000;
  }

  return null;
}

async function kickWithRetry(
  member: GuildMember,
  reason: string,
  currentDelay: number
): Promise<{ success: boolean; newDelay: number; wasRateLimited: boolean }> {
  let attempt = 0;
  let wasRateLimited = false;

  while (true) {
    try {
      console.log(
        `[${new Date().toLocaleTimeString()}] Tentando expulsar ${member.user.tag} (${member.user.id}) - Delay atual: ${formatTime(currentDelay)} (tentativa ${attempt + 1})`
      );

      await member.kick(`Limpeza automática: ${reason}`);

      console.log(`[${new Date().toLocaleTimeString()}] ✅ Sucesso ao expulsar ${member.user.tag}`);

      return {
        success: true,
        newDelay: Math.max(MIN_DELAY_MS, currentDelay - DELAY_DECREMENT),
        wasRateLimited: wasRateLimited,
      };
    } catch (error) {
      attempt++;
      const isRateLimit =
        error instanceof RateLimitError ||
        (error instanceof HTTPError && (error as DiscordAPIError).code === 429) ||
        (error instanceof DiscordAPIError && error.code === 429);

      if (isRateLimit) {
        wasRateLimited = true;
      }

      const retryAfter = getRetryAfter(error);
      const waitTime = retryAfter || RATE_LIMIT_BASE_DELAY * Math.pow(2, Math.min(attempt - 1, 4));
      const newDelay = isRateLimit
        ? Math.min(MAX_DELAY_MS, currentDelay + DELAY_INCREMENT)
        : Math.min(MAX_DELAY_MS, currentDelay + DELAY_INCREMENT * 2);

      if (isRateLimit) {
        console.warn(
          `[${new Date().toLocaleTimeString()}] ⚠️  Rate limit atingido para ${member.user.tag} (tentativa ${attempt})`
        );
      } else {
        console.error(
          `[${new Date().toLocaleTimeString()}] ❌ Erro ao expulsar ${member.user.tag}: ${error instanceof Error ? error.message : 'Erro desconhecido'} (tentativa ${attempt})`
        );
      }

      if (retryAfter) {
        console.log(
          `[${new Date().toLocaleTimeString()}] ⏳ Discord pediu para aguardar ${formatTime(retryAfter)} (retry_after do erro)`
        );
      } else {
        console.log(
          `[${new Date().toLocaleTimeString()}] ⏳ Aguardando ${formatTime(waitTime)} antes de retry...`
        );
      }

      console.log(
        `[${new Date().toLocaleTimeString()}] 📈 Aumentando delay de ${formatTime(currentDelay)} para ${formatTime(newDelay)}`
      );

      await sleep(waitTime);
      currentDelay = newDelay;
    }
  }
}

createCommand({
  name: 'cleanup',
  description: 'Expulsar membros inativos sem roles (entraram há mais de 30 dias)',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  global: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: 'dry-run',
      description: 'Apenas simular sem expulsar (ver quantos seriam expulsos)',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'execute',
      description: 'Executar a limpeza e expulsar os membros',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  async run(interaction) {
    const { options, guild } = interaction;

    if (!guild) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const botMember = await guild.members.fetchMe();
    const isDryRun = options.getSubcommand() === 'dry-run';

    try {
      const allMembers = await guild.members.fetch();
      const now = Date.now();
      const fifteenDaysAgo = now - THIRTY_DAYS_MS;

      const membersToKick: Array<{ member: GuildMember; reason: string }> = [];

      for (const member of allMembers.values()) {
        if (member.user.bot) continue;
        if (member.id === guild.ownerId) continue;
        if (member.id === botMember.id) continue;

        const joinedAt = member.joinedAt;
        if (!joinedAt) continue;

        const joinedTimestamp = joinedAt.getTime();
        if (joinedTimestamp > fifteenDaysAgo) continue;

        const roles = member.roles.cache.filter((role) => role.id !== guild.id);
        if (roles.size > 0) continue;

        if (member.roles.highest.position >= botMember.roles.highest.position) {
          continue;
        }

        membersToKick.push({
          member,
          reason: 'Sem roles e inativo há mais de 30 dias',
        });
      }

      if (isDryRun) {
        const baseMessage = `🔍 **Simulação de Limpeza**\n\n📊 **Resultados:**\n• Total de membros verificados: ${allMembers.size}\n• Membros que seriam expulsos: ${membersToKick.length}\n\n`;
        const footer = `\n\n💡 Use \`/cleanup execute\` para executar a limpeza.`;
        const maxLength = 2000;
        const availableLength = maxLength - baseMessage.length - footer.length;

        let content: string;
        if (membersToKick.length === 0) {
          content = baseMessage + '✅ Nenhum membro precisa ser expulsado.' + footer;
        } else {
          const header = '**Membros a expulsar:**\n';
          const remainingLength = availableLength - header.length;

          let membersList = '';
          let shownCount = 0;

          for (const { member } of membersToKick) {
            const memberLine = `• ${member.user.tag} (${member.user.id})\n`;
            const remainingMembers = membersToKick.length - shownCount - 1;
            const moreText = remainingMembers > 0 ? `\n... e mais ${remainingMembers} membros` : '';
            const testList = membersList + memberLine;
            const testContent = testList + moreText;

            if (testContent.length > remainingLength) {
              break;
            }

            membersList = testList;
            shownCount++;
          }

          if (shownCount < membersToKick.length) {
            membersList += `... e mais ${membersToKick.length - shownCount} membros`;
          }

          content = baseMessage + header + membersList.trim() + footer;
        }

        await interaction.editReply({
          content: content.slice(0, maxLength),
        });
        return;
      }

      if (membersToKick.length === 0) {
        await interaction.editReply({
          content: '✅ Nenhum membro precisa ser expulsado.',
        });
        return;
      }

      let kickedCount = 0;
      let failedCount = 0;
      const failedMembers: string[] = [];
      const totalMembers = membersToKick.length;
      let processedCount = 0;
      let currentDelay = INITIAL_DELAY_MS;
      let consecutiveSuccesses = 0;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 Iniciando limpeza de ${totalMembers} membros`);
      console.log(`📊 Delay inicial: ${formatTime(INITIAL_DELAY_MS)}`);
      console.log(`${'='.repeat(60)}\n`);

      const updateProgress = async () => {
        if (processedCount % 10 === 0 || processedCount === totalMembers) {
          const progressPercent = ((processedCount / totalMembers) * 100).toFixed(1);
          await interaction
            .editReply({
              content: `🔄 A expulsar membros...\n\n📊 Progresso: ${processedCount}/${totalMembers} (${progressPercent}%)\n✅ Expulsos: ${kickedCount}\n❌ Falhas: ${failedCount}\n⏱️ Delay atual: ${formatTime(currentDelay)}`,
            })
            .catch(() => null);
        }
      };

      await updateProgress();

      const startTime = Date.now();

      for (const { member, reason } of membersToKick) {
        try {
          const result = await kickWithRetry(member, reason, currentDelay);

          kickedCount++;
          consecutiveSuccesses++;

          currentDelay = result.newDelay;

          if (result.wasRateLimited) {
            console.log(
              `[${new Date().toLocaleTimeString()}] 📉 Reduzindo delay para ${formatTime(currentDelay)} (sucessos consecutivos: ${consecutiveSuccesses})`
            );
          }
        } catch (error) {
          console.error(
            `[${new Date().toLocaleTimeString()}] ❌ Erro crítico ao processar ${member.user.tag}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          );
          failedCount++;
          failedMembers.push(`${member.user.tag} (${member.user.id})`);
          consecutiveSuccesses = 0;
        }

        processedCount++;

        const elapsed = Date.now() - startTime;
        const avgTimePerMember = elapsed / processedCount;
        const remaining = totalMembers - processedCount;
        const estimatedTimeRemaining = remaining * avgTimePerMember;

        console.log(
          `[${new Date().toLocaleTimeString()}] 📊 Status: ${processedCount}/${totalMembers} processados | ` +
            `✅ ${kickedCount} expulsos | ❌ ${failedCount} falhas | ` +
            `⏱️ Tempo estimado restante: ${formatTime(estimatedTimeRemaining)}`
        );

        await updateProgress();

        if (processedCount < totalMembers) {
          console.log(
            `[${new Date().toLocaleTimeString()}] ⏳ Aguardando ${formatTime(currentDelay)} antes do próximo membro...\n`
          );
          await sleep(currentDelay);
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ Limpeza concluída!`);
      console.log(`📊 Total processado: ${processedCount}/${totalMembers}`);
      console.log(`✅ Expulsos com sucesso: ${kickedCount}`);
      console.log(`❌ Falhas: ${failedCount}`);
      console.log(`⏱️ Tempo total: ${formatTime(totalTime)}`);
      console.log(`📈 Delay final: ${formatTime(currentDelay)}`);
      console.log(`${'='.repeat(60)}\n`);

      const baseMessage = `✅ **Limpeza Concluída**\n\n📊 **Resultados:**\n• Membros expulsos: ${kickedCount}\n`;
      const maxLength = 2000;
      let resultMessage = baseMessage;

      if (failedCount > 0) {
        const failedHeader = `• Falhas: ${failedCount}\n\n**Membros que não puderam ser expulsos:**\n`;
        const availableLength = maxLength - baseMessage.length - failedHeader.length;
        let failedList = '';

        for (let i = 0; i < Math.min(failedMembers.length, 10); i++) {
          const memberLine = `${failedMembers[i]}\n`;
          if (failedList.length + memberLine.length > availableLength - 20) {
            failedList += `... e mais ${failedMembers.length - i} membros`;
            break;
          }
          failedList += memberLine;
        }

        if (failedMembers.length > 10 && !failedList.includes('... e mais')) {
          failedList += `... e mais ${failedMembers.length - 10} membros`;
        }

        resultMessage += failedHeader + failedList.trim();
      }

      await interaction.editReply({
        content: resultMessage.slice(0, maxLength),
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Ocorreu um erro ao executar a limpeza: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    }
  },
});
